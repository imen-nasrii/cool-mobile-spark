export default function SimpleApp() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-red-500 p-4 shadow-sm">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-red-500">Tomati Market</h1>
          <p className="text-gray-600 text-sm">Marketplace Tunisienne</p>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Bienvenue sur Tomati Market</h2>
          <p className="text-lg text-gray-600 mb-8">Achetez et vendez en toute confiance</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-blue-600 text-xl">🚗</span>
              </div>
              <h3 className="font-bold text-lg text-blue-600 mb-2">Voitures</h3>
              <p className="text-sm text-gray-600">Trouvez votre voiture idéale</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-green-600 text-xl">🏠</span>
              </div>
              <h3 className="font-bold text-lg text-green-600 mb-2">Immobilier</h3>
              <p className="text-sm text-gray-600">Maisons et appartements</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-purple-600 text-xl">💼</span>
              </div>
              <h3 className="font-bold text-lg text-purple-600 mb-2">Emplois</h3>
              <p className="text-sm text-gray-600">Opportunités de carrière</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-gray-600 text-xl">📦</span>
              </div>
              <h3 className="font-bold text-lg text-gray-600 mb-2">Autres</h3>
              <p className="text-sm text-gray-600">Tout ce dont vous avez besoin</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Bottom navigation - MOBILE ONLY */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-red-500 md:hidden">
        <div className="flex justify-around items-center py-2">
          <button className="flex flex-col items-center p-3 text-red-500 transition-colors">
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-xs font-medium">Accueil</span>
          </button>
          <button className="flex flex-col items-center p-3 text-gray-600 hover:text-red-500 transition-colors">
            <span className="text-2xl mb-1">🔍</span>
            <span className="text-xs">Recherche</span>
          </button>
          <button className="flex flex-col items-center p-3 text-gray-600 hover:text-red-500 transition-colors">
            <span className="text-2xl mb-1">🗺️</span>
            <span className="text-xs">Carte</span>
          </button>
          <button className="flex flex-col items-center p-3 text-gray-600 hover:text-red-500 transition-colors">
            <span className="text-2xl mb-1">💬</span>
            <span className="text-xs">Messages</span>
          </button>
          <button className="flex flex-col items-center p-3 text-gray-600 hover:text-red-500 transition-colors">
            <span className="text-2xl mb-1">👤</span>
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </div>
      
      {/* Footer - DESKTOP ONLY */}
      <footer className="hidden md:block bg-gradient-to-br from-gray-900 via-red-900 to-black text-white py-12 mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-white">Tomati Market</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Votre marketplace de confiance en Tunisie. Achetez, vendez et découvrez 
                des milliers de produits dans un environnement sécurisé.
              </p>
              <div className="flex space-x-4">
                <button className="text-gray-300 hover:text-red-400 p-2 rounded transition-colors">
                  <span className="text-sm">Facebook</span>
                </button>
                <button className="text-gray-300 hover:text-red-400 p-2 rounded transition-colors">
                  <span className="text-sm">Twitter</span>
                </button>
                <button className="text-gray-300 hover:text-red-400 p-2 rounded transition-colors">
                  <span className="text-sm">Instagram</span>
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-red-400 transition-colors">Accueil</a></li>
                <li><a href="/search" className="text-gray-300 hover:text-red-400 transition-colors">Rechercher</a></li>
                <li><a href="/map" className="text-gray-300 hover:text-red-400 transition-colors">Carte</a></li>
                <li><a href="/messages" className="text-gray-300 hover:text-red-400 transition-colors">Messages</a></li>
                <li><a href="/profile" className="text-gray-300 hover:text-red-400 transition-colors">Mon Profil</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Catégories</h4>
              <ul className="space-y-2">
                <li><a href="/voiture" className="text-gray-300 hover:text-red-400 transition-colors">🚗 Voitures</a></li>
                <li><a href="/immobilier" className="text-gray-300 hover:text-red-400 transition-colors">🏠 Immobilier</a></li>
                <li><a href="/emplois" className="text-gray-300 hover:text-red-400 transition-colors">💼 Emplois</a></li>
                <li><a href="/autres" className="text-gray-300 hover:text-red-400 transition-colors">📦 Autres</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-3">
                <p className="text-gray-300">📧 contact@tomatimarket.tn</p>
                <p className="text-gray-300">📞 +216 20 123 456</p>
                <p className="text-gray-300">📍 Tunis, Tunisie</p>
              </div>
              <button className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                Nous Contacter
              </button>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 mb-4 md:mb-0">© 2024 Tomati Market. Tous droits réservés.</p>
              <div className="flex space-x-6">
                <a href="/privacy" className="text-gray-300 hover:text-red-400 transition-colors">Confidentialité</a>
                <a href="/terms" className="text-gray-300 hover:text-red-400 transition-colors">Conditions</a>
                <a href="/help" className="text-gray-300 hover:text-red-400 transition-colors">Aide</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}