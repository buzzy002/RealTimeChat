import json
import re

from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST, require_http_methods

from .forms import SignUpForm
from .models import Channel, Workspace, WorkspaceMembership, User


def _read_json(request):
    """Renvoie le corps JSON s'il s'agit d'un objet, sinon None."""
    try:
        data = json.loads(request.body or b'{}')
    except ValueError:
        return None
    return data if isinstance(data, dict) else None


def _bad_json():
    return JsonResponse(
        {'errors': {'__all__': [{'message': 'Invalid request.', 'code': 'invalid'}]}},
        status=400,
    )


def _user_data(user):
    return {'id': user.id, 'username': user.username, 'email': user.email}


@require_GET
@ensure_csrf_cookie
def me(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'user': _user_data(request.user)})
    return JsonResponse({'authenticated': False, 'user': None})


@require_POST
def login_view(request):
    data = _read_json(request)
    if data is None:
        return _bad_json()
    form = AuthenticationForm(request, data=data)
    if not form.is_valid():
        return JsonResponse({'errors': form.errors.get_json_data()}, status=400)
    user = form.get_user()
    login(request, user)
    return JsonResponse({'user': _user_data(user)})

def _join_default_workspace(user):
    """Give a new user access to the default workspace and its 'general' channel."""
    workspace, _ = Workspace.objects.get_or_create(name=settings.DEFAULT_WORKSPACE_NAME)
    Channel.objects.get_or_create(name="general", workspace=workspace)
    WorkspaceMembership.objects.get_or_create(user=user, workspace=workspace)

@require_POST
def register_view(request):
    data = _read_json(request)
    if data is None:
        return _bad_json()
    form = SignUpForm(data)
    if not form.is_valid():
        return JsonResponse({'errors': form.errors.get_json_data()}, status=400)
    with transaction.atomic():
        user = form.save()
        _join_default_workspace(user)
    login(request, user)
    return JsonResponse({'user': _user_data(user)}, status=201)


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({'ok': True})

def _error(message, code, status):
    return JsonResponse({'errors': {'__all__': [{'message': message, 'code': code}]}}, status=status)


def _channel_data(channel, user=None):
    data = {
        'id': channel.id,
        'name': channel.name,
        'workspace': channel.workspace.name,
        'workspace_id': channel.workspace_id,
        'is_direct': channel.is_direct,
    }
    if channel.is_direct and user is not None:
        others = [m.username for m in channel.members.all() if m.id != user.id]
        data['name'] = others[0] if others else user.username
    return data


@require_http_methods(['GET', 'POST'])
def channels_view(request):
    if not request.user.is_authenticated:
        return _error('Authentication required.', 'auth', 401)

    if request.method == 'GET':
        channels = (
            Channel.objects.visible_to(request.user)
            .select_related('workspace')
            .prefetch_related('members')
            .order_by('workspace__name', 'name')
        )
        return JsonResponse({'channels': [_channel_data(c, request.user) for c in channels]})
    
    data = _read_json(request)
    if data is None:
        return _bad_json()

    raw_name = str(data.get('name', '')).strip().lower()
    name = re.sub(r'[^a-z0-9_-]+', '-', raw_name).strip('-')[:100]
    if not name:
        return _error('Channel name is required.', 'required', 400)

    try:
        workspace_id = int(data.get('workspace_id'))
    except (TypeError, ValueError):
        return _error('Invalid workspace.', 'invalid', 400)

    membership = (
        WorkspaceMembership.objects.filter(user=request.user, workspace_id=workspace_id)
        .exclude(role='guest')
        .select_related('workspace')
        .first()
    )
    if membership is None:
        return _error('You cannot create channels in this workspace.', 'forbidden', 403)

    channel, created = Channel.objects.get_or_create(name=name, workspace=membership.workspace)
    if not created:
        return _error('A channel with this name already exists.', 'duplicate', 400)
    return JsonResponse({'channel': _channel_data(channel)}, status=201)

@require_GET
def users_view(request):
    """Colleagues: people who share at least one workspace with the current user."""
    if not request.user.is_authenticated:
        return _error('Authentication required.', 'auth', 401)
    users = (
        User.objects.filter(memberships__workspace__in=request.user.memberships.values('workspace'))
        .exclude(id=request.user.id)
        .distinct()
        .order_by('username')
    )
    return JsonResponse({'users': [{'id': u.id, 'username': u.username} for u in users]})


@require_POST
def open_dm_view(request):
    """Return the direct conversation with a colleague, creating it the first time."""
    if not request.user.is_authenticated:
        return _error('Authentication required.', 'auth', 401)
    data = _read_json(request)
    if data is None:
        return _bad_json()

    try:
        other_id = int(data.get('user_id'))
    except (TypeError, ValueError):
        return _error('Invalid user.', 'invalid', 400)
    if other_id == request.user.id:
        return _error('You cannot message yourself.', 'invalid', 400)

    shared = (
        WorkspaceMembership.objects.filter(
            user_id=other_id, workspace__in=request.user.memberships.values('workspace')
        )
        .select_related('user', 'workspace')
        .order_by('workspace_id')
        .first()
    )
    if shared is None:
        return _error('You can only message people from your workspaces.', 'forbidden', 403)
    other = shared.user

    channel = (
        Channel.objects.filter(is_direct=True, members=request.user)
        .filter(members=other)
        .first()
    )
    if channel is not None:
        return JsonResponse({'channel': _channel_data(channel, request.user)})

    low, high = sorted([request.user.id, other.id])
    with transaction.atomic():
        channel = Channel.objects.create(
            name=f'dm-{low}-{high}', workspace=shared.workspace, is_direct=True
        )
        channel.members.add(request.user, other)
    return JsonResponse({'channel': _channel_data(channel, request.user)}, status=201)