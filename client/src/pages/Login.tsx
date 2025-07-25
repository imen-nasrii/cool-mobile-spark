import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, UserCheck, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${result.user?.display_name || result.user?.email}`,
        });

        // Redirection basée sur le rôle
        if (result.user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(result.error || "Échec de la connexion");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'user' | 'admin') => {
    setIsLoading(true);
    setError("");

    try {
      let credentials;
      if (role === 'admin') {
        credentials = { email: 'admin@tomati.com', password: 'admin123' };
      } else {
        credentials = { email: 'user@tomati.com', password: 'user123' };
      }

      const result = await login(credentials.email, credentials.password);
      
      if (result.success) {
        toast({
          title: "Connexion réussie",
          description: `Connecté en tant que ${role === 'admin' ? 'Administrateur' : 'Utilisateur'}`,
        });

        // Redirection basée sur le rôle
        if (role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        setError(result.error || "Échec de la connexion");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo et titre */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text text-transparent">
            Tomati
          </h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        {/* Boutons de connexion rapide */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 h-12 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
            onClick={() => handleQuickLogin('user')}
            disabled={isLoading}
          >
            <UserCheck size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">Utilisateur</div>
              <div className="text-xs text-gray-500">Accès normal</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2 h-12 border-green-200 hover:border-green-300 hover:bg-green-50"
            onClick={() => handleQuickLogin('admin')}
            disabled={isLoading}
          >
            <Shield size={18} />
            <div className="text-left">
              <div className="text-sm font-medium">Admin</div>
              <div className="text-xs text-gray-500">Gestion</div>
            </div>
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Ou connectez-vous avec</span>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Connexion manuelle</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@tomati.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informations de test */}
        <Card className="border-0 bg-gradient-to-r from-purple-100 to-green-100">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-gray-800">Comptes de test</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-purple-700">Administrateur</div>
                  <div className="text-gray-600">admin@tomati.com</div>
                  <div className="text-gray-600">admin123</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-green-700">Utilisateur</div>
                  <div className="text-gray-600">user@tomati.com</div>
                  <div className="text-gray-600">user123</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};