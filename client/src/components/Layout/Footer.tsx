import { Heart, Mail, MapPin, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import tomatiLogo from "@assets/aae7f946-dd84-4586-bf04-366fe47253c4_1755638455493.jpg";

export const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    marketplace: {
      title: "Marketplace",
      links: [
        { label: "Acheter", href: "/?tab=search" },
        { label: "Vendre", href: "/?tab=add" },
        { label: "Carte", href: "/map" },
        { label: "Favoris", href: "/?tab=favorites" }
      ]
    },
    categories: {
      title: "Catégories",
      links: [
        { label: "Voitures", href: "/?category=voiture" },
        { label: "Immobilier", href: "/?category=immobilier" },
        { label: "Emplois", href: "/?category=emplois" },
        { label: "Autres", href: "/?category=autres" }
      ]
    },
    aide: {
      title: "Aide & Support",
      links: [
        { label: "Centre d'aide", href: "/help" },
        { label: "Conditions d'utilisation", href: "/terms" },
        { label: "Politique de confidentialité", href: "/privacy" },
        { label: "Nous contacter", href: "/contact" }
      ]
    }
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
    } else {
      window.open(href, '_blank');
    }
  };

  return (
    <footer className="bg-white border-t-2 border-red-500 mt-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src={tomatiLogo} 
                alt="Tomati Market" 
                className="h-12 w-auto object-contain cursor-pointer"
                onClick={() => navigate('/')}
              />
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Tomati Market - La plateforme de petites annonces en Tunisie. 
              Achetez et vendez facilement dans votre région.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>Tunisie</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={16} className="text-red-500" />
                <span>Made with love</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key} className="col-span-1">
              <h3 className="font-bold text-black mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleLinkClick(link.href)}
                      className="text-gray-600 hover:text-red-500 transition-colors text-sm"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:contact@tomati.org" className="hover:text-red-500 transition-colors">
                  contact@tomati.org
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+21612345678" className="hover:text-red-500 transition-colors">
                  +216 12 345 678
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/download')}
                className="text-gray-600 hover:text-red-500 border-gray-300"
              >
                <ExternalLink size={14} className="mr-2" />
                Télécharger l'app
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© 2025 Tomati Market. Tous droits réservés.</p>
            <p>Version 2.0.1 - Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};