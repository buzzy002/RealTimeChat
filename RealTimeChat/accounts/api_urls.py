from django.urls import path

from . import api

urlpatterns = [
    path('me/', api.me, name='api-me'),
    path('login/', api.login_view, name='api-login'),
    path('register/', api.register_view, name='api-register'),
    path('logout/', api.logout_view, name='api-logout'),
]