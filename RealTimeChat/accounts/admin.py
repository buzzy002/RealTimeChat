from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User,Channel, Message, Workspace, WorkspaceMembership

admin.site.register(User, UserAdmin)
admin.site.register(Workspace)
admin.site.register(WorkspaceMembership)
admin.site.register(Channel)
admin.site.register(Message)