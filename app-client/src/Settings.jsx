import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Settings() {
  // États pour les informations du profil
  const [username, setUsername] = useState("MonNomActuel")
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  // États pour le changement de mot de passe
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Référence pour l'input fichier masqué (avatar)
  const fileInputRef = useRef(null)

  // Gestion du choix de l'avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file)) // Pour afficher un aperçu immédiat
    }
  }

  // Soumission du profil (Nom + Avatar)
  const handleProfileSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("username", username)
    if (avatarFile) {
      formData.append("avatar", avatarFile)
    }

    // TODO: Envoyer formData via une requête PATCH/PUT vers l'API Django
    console.log("Envoi du profil...", { username, avatarFile })
  }

  // Soumission du mot de passe
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.")
      return
    }

    // TODO: Envoyer une requête POST vers l'API Django pour changer le mot de passe
    console.log("Changement de mot de passe...")
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Paramètres du compte</h1>

      {/* SECTION PROFIL (Nom & Avatar) */}
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Mettez à jour vos informations personnelles et votre avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            
            {/* Gestion de l'Avatar */}
            <div className="flex items-center gap-4">
              <div 
                className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center cursor-pointer group"
                onClick={() => fileInputRef.current.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Modifier</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                  Changer
                </div>
              </div>

              {/* Input fichier masqué */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              <div>
                <p className="text-sm font-medium">Photo de profil</p>
                <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP (Max. 2Mo).</p>
              </div>
            </div>

            {/* Nom d'utilisateur */}
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>

            <Button type="submit">Enregistrer les modifications</Button>
          </form>
        </CardContent>
      </Card>

      {/* SECTION SECURITE (Mot de passe) */}
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>Modifiez votre mot de passe pour sécuriser votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">Ancien mot de passe</Label>
              <Input 
                id="old-password" 
                type="password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>

            <Button type="submit" variant="outline">Mettre à jour le mot de passe</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}