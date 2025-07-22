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
import { Loader2, ShoppingBag, Languages } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<'fr' | 'ar'>('fr');
  
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const text = {
    fr: {
      title: "Tomati Market",
      subtitle: "Rejoignez notre communauté d'acheteurs et de vendeurs",
      signIn: "Se connecter",
      signUp: "S'inscrire",
      signInTitle: "Se connecter",
      signInDesc: "Bon retour ! Connectez-vous à votre compte pour continuer.",
      signUpTitle: "S'inscrire",
      signUpDesc: "Créez un nouveau compte pour commencer à acheter et vendre.",
      email: "Email",
      password: "Mot de passe",
      displayName: "Nom d'affichage (Optionnel)",
      emailPlaceholder: "Entrez votre email",
      passwordPlaceholder: "Entrez votre mot de passe",
      createPasswordPlaceholder: "Créez un mot de passe",
      displayNamePlaceholder: "Entrez votre nom d'affichage",
      fillFields: "Veuillez remplir tous les champs",
      signUpFailed: "Échec de l'inscription",
      signInFailed: "Échec de la connexion",
      checkEmail: "Vérifiez votre email",
      checkEmailDesc: "Nous vous avons envoyé un lien de confirmation pour compléter votre inscription.",
      welcome: "Bienvenue !",
      welcomeDesc: "Vous vous êtes connecté avec succès.",
      terms: "En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité."
    },
    ar: {
      title: "سوق طماطي",
      subtitle: "انضم إلى مجتمعنا من المشترين والبائعين",
      signIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
      signInTitle: "تسجيل الدخول",
      signInDesc: "أهلاً بعودتك! سجل دخولك لحسابك للمتابعة.",
      signUpTitle: "إنشاء حساب",
      signUpDesc: "أنشئ حساب جديد لتبدأ بالشراء والبيع.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      displayName: "اسم العرض (اختياري)",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      passwordPlaceholder: "أدخل كلمة مرورك",
      createPasswordPlaceholder: "أنشئ كلمة مرور",
      displayNamePlaceholder: "أدخل اسم العرض",
      fillFields: "يرجى ملء جميع الحقول",
      signUpFailed: "فشل التسجيل",
      signInFailed: "فشل تسجيل الدخول",
      checkEmail: "تحقق من بريدك الإلكتروني",
      checkEmailDesc: "لقد أرسلنا لك رابط تأكيد لإتمام التسجيل.",
      welcome: "أهلاً وسهلاً",
      welcomeDesc: "لقد سجلت الدخول بنجاح.",
      terms: "بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية."
    }
  };

  const currentText = text[language];

  // Redirect authenticated users to main page
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(currentText.fillFields);
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await signUp(email, password, displayName);

    if (error) {
      setError(error.message);
      toast({
        title: currentText.signUpFailed,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: currentText.checkEmail,
        description: currentText.checkEmailDesc,
      });
    }

    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(currentText.fillFields);
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      toast({
        title: currentText.signInFailed,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: currentText.welcome,
        description: currentText.welcomeDesc,
      });
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Language Toggle */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-2"
          >
            <Languages size={16} />
            {language === 'fr' ? 'العربية' : 'Français'}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-tomati-red p-2 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{currentText.title}</h1>
          </div>
          <p className="text-gray-600">{currentText.subtitle}</p>
        </div>

        <Tabs defaultValue="signin" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{currentText.signIn}</TabsTrigger>
            <TabsTrigger value="signup">{currentText.signUp}</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>{currentText.signInTitle}</CardTitle>
                <CardDescription>
                  {currentText.signInDesc}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{currentText.email}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={currentText.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{currentText.password}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder={currentText.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {currentText.signIn}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>{currentText.signUpTitle}</CardTitle>
                <CardDescription>
                  {currentText.signUpDesc}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{currentText.displayName}</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={currentText.displayNamePlaceholder}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{currentText.email}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={currentText.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{currentText.password}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder={currentText.createPasswordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {currentText.signUp}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-600">
          <p>{currentText.terms}</p>
        </div>
      </div>
    </div>
  );
}