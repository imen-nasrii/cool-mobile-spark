import { Heart, Facebook, Twitter, Instagram, Mail, Phone, MapPin, Lightbulb, Users, Shield, Star } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden md:block bg-gradient-to-br from-gray-900 via-red-900 to-black text-white mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Tomati Market</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Votre marketplace de confiance en Tunisie. Achetez, vendez et découvrez 
              des milliers de produits dans un environnement sécurisé.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-300 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors">
                <Facebook className="h-5 w-5" />
              </button>
              <button className="text-gray-300 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors">
                <Twitter className="h-5 w-5" />
              </button>
              <button className="text-gray-300 hover:text-red-400 hover:bg-red-500/10 p-2 rounded transition-colors">
                <Instagram className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-red-400" />
              Liens Rapides
            </h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-red-400 transition-colors">Accueil</a></li>
              <li><a href="/?tab=search" className="text-gray-300 hover:text-red-400 transition-colors">Rechercher</a></li>
              <li><a href="/map" className="text-gray-300 hover:text-red-400 transition-colors">Carte</a></li>
              <li><a href="/messages" className="text-gray-300 hover:text-red-400 transition-colors">Messages</a></li>
              <li><a href="/profile" className="text-gray-300 hover:text-red-400 transition-colors">Profil</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Star className="h-5 w-5 mr-2 text-red-400" />
              Catégories
            </h4>
            <ul className="space-y-2">
              <li><a href="/?category=voiture" className="text-gray-300 hover:text-red-400 transition-colors">Voitures</a></li>
              <li><a href="/?category=immobilier" className="text-gray-300 hover:text-red-400 transition-colors">Immobilier</a></li>
              <li><a href="/?category=emplois" className="text-gray-300 hover:text-red-400 transition-colors">Emplois</a></li>
              <li><a href="/?category=autres" className="text-gray-300 hover:text-red-400 transition-colors">Autres</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-red-400" />
              Contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-red-400" />
                <span className="text-gray-300">contact@tomatimarket.tn</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-red-400" />
                <span className="text-gray-300">+216 20 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-red-400" />
                <span className="text-gray-300">Tunis, Tunisie</span>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center transition-colors">
                <Mail className="h-4 w-4 mr-2" />
                Nous Contacter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-700 mx-6"></div>

      {/* Bottom Bar */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-gray-400 text-sm">
            <span>© {currentYear} Tomati Market. Tous droits réservés.</span>
          </div>
          
          <div className="flex items-center space-x-6 text-gray-400 text-sm">
            <a href="/privacy" className="hover:text-red-400 transition-colors flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Confidentialité
            </a>
            <a href="/terms" className="hover:text-red-400 transition-colors">
              Conditions d'utilisation
            </a>
            <a href="/help" className="hover:text-red-400 transition-colors">
              Aide
            </a>
          </div>
        </div>
        
        {/* Feature Highlights */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-300">
              <Shield className="h-5 w-5 text-green-400" />
              <span>Paiements Sécurisés</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-300">
              <Users className="h-5 w-5 text-blue-400" />
              <span>Communauté Active</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-300">
              <Star className="h-5 w-5 text-yellow-400" />
              <span>Service Client 24/7</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    </footer>
  );
};