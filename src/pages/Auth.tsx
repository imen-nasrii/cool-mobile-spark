import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingBag } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect authenticated users to main page
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs - يرجى ملء جميع الحقول");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await signUp(email, password, displayName);

    if (error) {
      setError(error.message);
      toast({
        title: "Échec de l'inscription - فشل التسجيل",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Vérifiez votre email - تحقق من بريدك الإلكتروني",
        description: "Nous vous avons envoyé un lien de confirmation pour compléter votre inscription.",
      });
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs - يرجى ملء جميع الحقول");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      toast({
        title: "Échec de la connexion - فشل تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bienvenue ! - أهلاً وسهلاً",
        description: "Vous vous êtes connecté avec succès.",
      });
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-tomati-red p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tomati Market</h1>
          </div>
          <p className="text-gray-600">Rejoignez notre communauté d'acheteurs et de vendeurs - انضم إلى مجتمعنا من المشترين والبائعين</p>
        </div>

        <Tabs defaultValue="signin" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Se connecter - دخول</TabsTrigger>
            <TabsTrigger value="signup">S'inscrire - تسجيل</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Se connecter - تسجيل الدخول</CardTitle>
                <CardDescription>
                  Bon retour ! Connectez-vous à votre compte pour continuer.
                  أهلاً بعودتك! سجل دخولك لحسابك للمتابعة.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email - بريد إلكتروني</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Entrez votre email - أدخل بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe - كلمة المرور</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Entrez votre mot de passe - أدخل كلمة مرورك"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-tomati-red hover:bg-tomati-red/90"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter - دخول
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>S'inscrire - إنشاء حساب</CardTitle>
                <CardDescription>
                  Créez un nouveau compte pour commencer à acheter et vendre.
                  أنشئ حساب جديد لتبدأ بالشراء والبيع.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom d'affichage (Optionnel) - اسم العرض (اختياري)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Entrez votre nom d'affichage - أدخل اسم العرض"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email - بريد إلكتروني</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Entrez votre email - أدخل بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe - كلمة المرور</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Créez un mot de passe - أنشئ كلمة مرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-tomati-red hover:bg-tomati-red/90"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    S'inscrire - تسجيل
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-600">
          <p>En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.</p>
          <p className="mt-1 text-xs">بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية.</p>
        </div>
      </div>
    </div>
  );
}