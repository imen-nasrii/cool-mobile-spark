import { useState } from "react";
import { Briefcase, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StepsIndicator } from "@/components/UI/StepsIndicator";
import { ImageManager } from "@/components/Products/ImageManager";
import { LocationInput } from "@/components/common/LocationInput";
import { useToast } from "@/hooks/use-toast";

interface JobFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const jobTypes = [
  { value: "cdi", label: "CDI (Contrat à durée indéterminée)" },
  { value: "cdd", label: "CDD (Contrat à durée déterminée)" },
  { value: "stage", label: "Stage" },
  { value: "freelance", label: "Freelance/Indépendant" },
  { value: "part_time", label: "Temps partiel" },
  { value: "internship", label: "Alternance" }
];

const jobSectors = [
  { value: "informatique", label: "Informatique/IT" },
  { value: "commerce", label: "Commerce/Vente" },
  { value: "sante", label: "Santé/Médical" },
  { value: "education", label: "Éducation/Formation" },
  { value: "finance", label: "Finance/Banque" },
  { value: "marketing", label: "Marketing/Communication" },
  { value: "ingenierie", label: "Ingénierie" },
  { value: "rh", label: "Ressources Humaines" },
  { value: "juridique", label: "Juridique" },
  { value: "restauration", label: "Restauration/Hôtellerie" },
  { value: "construction", label: "Construction/BTP" },
  { value: "transport", label: "Transport/Logistique" },
  { value: "autre", label: "Autre secteur" }
];

const jobExperiences = [
  { value: "debutant", label: "Débutant (0-1 an)" },
  { value: "junior", label: "Junior (1-3 ans)" },
  { value: "confirme", label: "Confirmé (3-5 ans)" },
  { value: "senior", label: "Senior (5-10 ans)" },
  { value: "expert", label: "Expert (10+ ans)" }
];

const jobEducations = [
  { value: "bac", label: "Baccalauréat" },
  { value: "bac2", label: "Bac+2 (BTS/DUT)" },
  { value: "bac3", label: "Bac+3 (Licence)" },
  { value: "bac5", label: "Bac+5 (Master/Ingénieur)" },
  { value: "doctorat", label: "Doctorat/PhD" },
  { value: "aucun", label: "Aucun diplôme requis" }
];

const jobUrgencies = [
  { value: "normal", label: "Normal" },
  { value: "urgent", label: "Urgent" },
  { value: "tres_urgent", label: "Très urgent" }
];

export const JobForm = ({ onSubmit, onCancel }: JobFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const [newBenefit, setNewBenefit] = useState("");
  
  const [formData, setFormData] = useState({
    // Étape 1: Informations générales
    title: "",
    company: "",
    jobType: "",
    jobSector: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    
    // Étape 2: Exigences
    jobExperience: "",
    jobEducation: "",
    jobUrgency: "",
    remote: false,
    
    // Étape 3: Description et avantages
    description: "",
    benefits: [] as string[],
    
    // Images du poste (optionnelles)
    images: [] as string[]
  });

  const stepTitles = ["Informations", "Exigences", "Description & Photos"];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.company || !formData.jobType || !formData.jobSector || !formData.location) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.description) {
      toast({
        title: "Erreur", 
        description: "Veuillez ajouter une description du poste",
        variant: "destructive"
      });
      return;
    }

    const jobData = {
      title: formData.title,
      description: formData.description,
      price: formData.salaryMin && formData.salaryMax 
        ? `${formData.salaryMin} - ${formData.salaryMax} TND` 
        : "Salaire à négocier",
      location: formData.location,
      category: "emplois",
      is_free: true, // Les offres d'emploi sont gratuites
      image_url: formData.images.length > 0 ? formData.images[0] : '',
      images: JSON.stringify(formData.images),
      // Champs spécifiques emploi
      job_type: formData.jobType,
      job_sector: formData.jobSector,
      job_experience: formData.jobExperience,
      job_education: formData.jobEducation,
      job_salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
      job_salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      job_remote: formData.remote,
      job_urgency: formData.jobUrgency,
      job_company: formData.company,
      job_benefits: JSON.stringify(formData.benefits)
    };

    onSubmit(jobData);
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }));
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Briefcase className="text-purple-500" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">Publier une offre d'emploi</h1>
            </div>
            <p className="text-gray-600">Complétez les 3 étapes pour publier votre annonce</p>
          </div>

          {/* Steps Indicator */}
          <StepsIndicator 
            currentStep={currentStep} 
            totalSteps={3} 
            stepTitles={stepTitles}
          />

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations générales</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre du poste *</label>
                    <Input
                      placeholder="Ex: Développeur Web Full Stack"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise *</label>
                    <Input
                      placeholder="Nom de l'entreprise"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de contrat *</label>
                    <Select value={formData.jobType} onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choisir le type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secteur d'activité *</label>
                    <Select value={formData.jobSector} onValueChange={(value) => setFormData(prev => ({ ...prev, jobSector: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choisir le secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobSectors.map((sector) => (
                          <SelectItem key={sector.value} value={sector.value}>{sector.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Localisation *</label>
                    <LocationInput
                      value={formData.location}
                      onChange={(location) => setFormData(prev => ({ ...prev, location }))}
                      placeholder="Ville, région"
                      required
                    />
                  </div>
                </div>

                {/* Salaire */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Rémunération (optionnel)</label>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <Input
                      placeholder="Salaire min (TND)"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
                      className="h-12"
                      type="number"
                    />
                    <Input
                      placeholder="Salaire max (TND)"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
                      className="h-12"
                      type="number"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Exigences du poste</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expérience requise</label>
                    <Select value={formData.jobExperience} onValueChange={(value) => setFormData(prev => ({ ...prev, jobExperience: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Niveau d'expérience" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobExperiences.map((exp) => (
                          <SelectItem key={exp.value} value={exp.value}>{exp.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'études</label>
                    <Select value={formData.jobEducation} onValueChange={(value) => setFormData(prev => ({ ...prev, jobEducation: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Niveau requis" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobEducations.map((edu) => (
                          <SelectItem key={edu.value} value={edu.value}>{edu.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urgence du recrutement</label>
                    <Select value={formData.jobUrgency} onValueChange={(value) => setFormData(prev => ({ ...prev, jobUrgency: value }))}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Urgence" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobUrgencies.map((urgency) => (
                          <SelectItem key={urgency.value} value={urgency.value}>{urgency.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Télétravail */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={formData.remote}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, remote: !!checked }))}
                  />
                  <label htmlFor="remote" className="text-sm text-gray-700">
                    Télétravail possible
                  </label>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description et avantages</h2>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description du poste *</label>
                  <Textarea
                    placeholder="Décrivez le poste, les missions, les responsabilités, le profil recherché..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                {/* Photos du poste (optionnelles) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Photos du poste (optionnelles)
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Ajoutez des photos de l'entreprise, de l'équipe ou du lieu de travail
                  </p>
                  <ImageManager
                    images={formData.images}
                    onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                    maxImages={5}
                    className="mb-6"
                  />
                </div>

                {/* Avantages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Avantages proposés</label>
                  
                  {/* Ajout d'avantage */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Ex: Mutuelle, tickets restaurant..."
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      className="h-10"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                    <Button
                      type="button"
                      onClick={addBenefit}
                      className="h-10 px-4"
                      variant="outline"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  {/* Liste des avantages */}
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                      >
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(benefit)}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? onCancel : handlePrevious}
                className="px-6"
              >
                <ArrowLeft size={16} className="mr-2" />
                {currentStep === 1 ? "Annuler" : "Précédent"}
              </Button>
              
              <Button
                type="button"
                onClick={currentStep === 3 ? handleSubmit : handleNext}
                className="px-6 bg-purple-500 hover:bg-purple-600"
              >
                {currentStep === 3 ? "Publier l'offre" : "Suivant"}
                {currentStep < 3 && <ArrowRight size={16} className="ml-2" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};