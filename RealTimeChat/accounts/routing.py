from django.urls import path

from .consumers import ChannelConsumer

websocket_urlpatterns = [
    path("ws/channels/<int:channel_id>/", ChannelConsumer.as_asgi()),
]