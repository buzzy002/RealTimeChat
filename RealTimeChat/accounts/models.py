from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q

# 1. AUTHENTIFICATION
class User(AbstractUser):
    pass

# 2. STRUCTURE B2B & ORGANISATIONS
class Workspace(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class WorkspaceMembership(models.Model):
    """Liaison sécurisée entre un utilisateur et un Workspace avec un rôle précis"""
    ROLE_CHOICES = (
        ('admin', 'Administrateur'),
        ('member', 'Membre'),
        ('guest', 'Invité'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'workspace') 

    def __str__(self):
        return f"{self.user.username} ({self.role}) dans {self.workspace.name}"

class UserProfile(models.Model):
    """Informations de profil globales (avatar, statut)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    status_text = models.CharField(max_length=150, blank=True, null=True) # Ex: "En réunion 🚀"
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return f"Profil de {self.user.username}"

# 3. CANAUX DE DISCUSSIONS
class ChannelQuerySet(models.QuerySet):
    def visible_to(self, user):
        """Channels this user may read: workspace channels, plus their own direct conversations."""
        return self.filter(
            Q(is_direct=False, workspace__in=user.memberships.values("workspace"))
            | Q(is_direct=True, id__in=user.direct_channels.values("id"))
        )

class Channel(models.Model):
    name = models.CharField(max_length=100)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='channels')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_direct = models.BooleanField(default=False)
    members = models.ManyToManyField(User, blank=True, related_name="direct_channels")

    objects = ChannelQuerySet.as_manager()

    def __str__(self):
        return f"#{self.name} [{self.workspace.name}]"

#  MESSAGERIE DES CANAUX
class Message(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    file = models.FileField(upload_to='chat_files/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Options avancées B2B
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies') # Pour les fils de discussion
    is_edited = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} dans #{self.channel.name}"

# RÉACTIONS AUX MESSAGES (Émojis)
class MessageReaction(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reactions')
    emoji = models.CharField(max_length=10) # Ex: '👍', '🔥', '❤️'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user', 'emoji') 

    def __str__(self):
        return f"{self.user.username} a réagi {self.emoji}"