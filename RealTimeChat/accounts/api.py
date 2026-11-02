import json

from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .forms import SignUpForm
from .models import Channel, Workspace, WorkspaceMembership


def _read_json(request):
    """Renvoie le corps JSON s'il s'agit d'un objet, sinon None."""
    try:
        data = json.loads(request.body or b'{}')
    except ValueError:
        return None
    return data if isinstance(data, dict) else None


def _bad_json():
    return JsonResponse(
        {'errors': {'__all__': [{'message': 'Requête invalide.', 'code': 'invalid'}]}},
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