import re
import json
from datetime import datetime
from typing import Dict, List, Optional

class TomatiChatBot:
    def __init__(self):
        self.knowledge_base = {
            "greetings": [
                "bonjour", "salut", "hello", "hi", "bonsoir", "bonne journée"
            ],
            "products": [
                "produit", "article", "item", "achat", "acheter", "vendre", "vente"
            ],
            "delivery": [
                "livraison", "livrer", "expédition", "envoyer", "délai", "transport"
            ],
            "payment": [
                "paiement", "payer", "prix", "coût", "tarif", "montant", "facture"
            ],
            "account": [
                "compte", "profil", "inscription", "connexion", "mot de passe"
            ],
            "support": [
                "aide", "problème", "erreur", "bug", "support", "assistance"
            ],
            "goodbye": [
                "au revoir", "bye", "à bientôt", "merci", "à plus"
            ]
        }
        
        self.responses = {
            "greetings": [
                "Bonjour ! Je suis votre assistant Tomati. Comment puis-je vous aider aujourd'hui ?",
                "Salut ! Bienvenue sur Tomati Market. Que puis-je faire pour vous ?",
                "Bonjour ! Je suis là pour répondre à vos questions sur notre marketplace."
            ],
            "products": [
                "Nous avons une large gamme de produits sur Tomati Market. Vous pouvez parcourir nos catégories ou utiliser la recherche pour trouver ce que vous cherchez. Avez-vous un produit particulier en tête ?",
                "Pour vendre un produit, connectez-vous à votre compte et cliquez sur 'Vendre un article'. Pour acheter, parcourez nos offres et contactez directement les vendeurs.",
                "Tous nos produits sont vérifiés par notre équipe. Vous pouvez voir les détails, photos et contacter le vendeur pour plus d'informations."
            ],
            "delivery": [
                "La livraison dépend du vendeur et de votre localisation. Chaque vendeur indique ses conditions de livraison sur sa fiche produit.",
                "Les délais de livraison varient selon le vendeur et la région. Contactez directement le vendeur pour connaître les délais exacts.",
                "Vous pouvez convenir des modalités de livraison directement avec le vendeur via notre système de messagerie."
            ],
            "payment": [
                "Les paiements se font directement entre acheteur et vendeur. Nous recommandons les paiements sécurisés et de vérifier l'identité du vendeur.",
                "Les prix sont fixés par chaque vendeur. Vous pouvez négocier directement avec eux via notre messagerie.",
                "Pour votre sécurité, évitez les paiements à l'avance et privilégiez les rencontres en personne ou les paiements sécurisés."
            ],
            "account": [
                "Pour créer un compte, cliquez sur 'S'inscrire' en haut de la page. C'est gratuit et rapide !",
                "Si vous avez oublié votre mot de passe, utilisez l'option 'Mot de passe oublié' sur la page de connexion.",
                "Vous pouvez modifier vos informations de profil en vous connectant et en allant dans 'Mon Profil'."
            ],
            "support": [
                "Si vous rencontrez un problème technique, essayez de rafraîchir la page ou de vous reconnecter.",
                "Pour signaler un problème avec un vendeur ou un acheteur, contactez notre équipe support.",
                "Notre équipe est là pour vous aider. Pouvez-vous me décrire votre problème plus précisément ?"
            ],
            "goodbye": [
                "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions.",
                "Merci d'avoir utilisé Tomati Market ! À bientôt !",
                "Bonne journée ! J'espère que vous trouverez ce que vous cherchez sur notre marketplace."
            ],
            "default": [
                "Je ne suis pas sûr de comprendre votre question. Pouvez-vous la reformuler ?",
                "Pouvez-vous être plus précis ? Je peux vous aider avec les produits, la livraison, les paiements ou votre compte.",
                "Je suis là pour vous aider ! Posez-moi des questions sur Tomati Market, nos produits ou services."
            ]
        }
        
        self.faq = {
            "comment vendre": "Pour vendre sur Tomati Market : 1) Créez un compte, 2) Connectez-vous, 3) Cliquez sur 'Vendre un article', 4) Ajoutez photos et description, 5) Publiez votre annonce !",
            "comment acheter": "Pour acheter : 1) Parcourez les produits, 2) Contactez le vendeur via la messagerie, 3) Convenez des modalités, 4) Finalisez la transaction.",
            "frais": "Tomati Market est gratuit pour les acheteurs et vendeurs. Aucun frais caché !",
            "sécurité": "Pour votre sécurité : rencontrez-vous dans des lieux publics, vérifiez l'identité, évitez les paiements à l'avance.",
            "contact": "Vous pouvez nous contacter via le formulaire de contact ou directement par notre messagerie interne."
        }

    def preprocess_message(self, message: str) -> str:
        """Nettoie et normalise le message d'entrée"""
        message = message.lower().strip()
        # Supprime la ponctuation excessive
        message = re.sub(r'[!?]{2,}', '!', message)
        message = re.sub(r'\.{2,}', '.', message)
        return message

    def detect_intent(self, message: str) -> str:
        """Détecte l'intention du message"""
        message = self.preprocess_message(message)
        
        # Vérifie d'abord les FAQ exactes
        for key, response in self.faq.items():
            if key in message:
                return f"faq:{key}"
        
        # Détecte l'intention par mots-clés
        for intent, keywords in self.knowledge_base.items():
            for keyword in keywords:
                if keyword in message:
                    return intent
        
        return "default"

    def generate_response(self, message: str, user_context: Optional[Dict] = None) -> Dict:
        """Génère une réponse basée sur le message et le contexte utilisateur"""
        intent = self.detect_intent(message)
        
        # Gestion des FAQ
        if intent.startswith("faq:"):
            faq_key = intent.split(":", 1)[1]
            return {
                "response": self.faq[faq_key],
                "intent": "faq",
                "confidence": 0.9,
                "timestamp": datetime.now().isoformat()
            }
        
        # Réponses contextuelles
        if user_context:
            if intent == "products" and user_context.get("is_seller"):
                response = "En tant que vendeur, vous pouvez gérer vos produits depuis votre tableau de bord. Voulez-vous ajouter un nouveau produit ?"
            elif intent == "account" and user_context.get("is_logged_in"):
                response = "Vous êtes déjà connecté ! Vous pouvez accéder à votre profil ou gérer vos annonces."
            else:
                response = self.responses.get(intent, self.responses["default"])[0]
        else:
            response = self.responses.get(intent, self.responses["default"])[0]
        
        return {
            "response": response,
            "intent": intent,
            "confidence": 0.8 if intent != "default" else 0.3,
            "timestamp": datetime.now().isoformat(),
            "suggestions": self.get_suggestions(intent)
        }

    def get_suggestions(self, intent: str) -> List[str]:
        """Retourne des suggestions basées sur l'intention"""
        suggestions = {
            "greetings": ["Comment vendre un produit ?", "Comment acheter ?", "Y a-t-il des frais ?"],
            "products": ["Comment fixer un prix ?", "Comment ajouter des photos ?", "Politique de retour ?"],
            "delivery": ["Zones de livraison", "Frais de transport", "Délais moyens"],
            "payment": ["Moyens de paiement sûrs", "Éviter les arnaques", "Négocier le prix"],
            "account": ["Modifier mon profil", "Supprimer mon compte", "Problème de connexion"],
            "support": ["Signaler un problème", "Contacter l'équipe", "FAQ complète"],
            "default": ["Vendre un produit", "Acheter un article", "Créer un compte", "Nous contacter"]
        }
        return suggestions.get(intent, suggestions["default"])

# Instance globale du chatbot
chatbot = TomatiChatBot()

def get_bot_response(message: str, user_context: Optional[Dict] = None) -> Dict:
    """Function d'interface pour obtenir une réponse du bot"""
    return chatbot.generate_response(message, user_context)