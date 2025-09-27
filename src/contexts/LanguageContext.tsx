import React, { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.reported': 'Mascotas Reportadas',
    'nav.lost': 'Mascotas Perdidas',
    'nav.marketplace': 'Compra y Venta',
    'nav.veterinarians': 'Veterinarios',
    'nav.adoptions': 'Adopciones',
    'nav.support': 'Soporte',
    'nav.dashboard': 'Datos de cuenta',
    'nav.saved': 'Guardados',
    'nav.profile': 'Perfil',
    
    // Homepage
    'home.welcome': 'Bienvenido a Pawsi',
    'home.subtitle': 'Ayuda a reunir mascotas con sus familias',
    'home.animalSighted': 'Animal Avistado',
    'home.animalSightedDesc': 'Reporta una mascota que has visto',
    'home.reportSighting': 'Reportar Avistamiento',
    'home.lostPet': 'Mascota Perdida',
    'home.lostPetDesc': 'Publica una alerta de mascota perdida',
    'home.postAlert': 'Publicar Alerta',
    'home.adoptions': 'Adopciones',
    'home.buySell': 'Compra y Venta',
    'home.latestNews': 'Últimas Noticias',
    // clave que usa Adoptions
    'home.publishAdoption': 'Publicar Adopción',
    
    // Authentication
    'auth.welcome': 'Bienvenido a Pawsi',
    'auth.subtitle': 'Inicia sesión para ayudar a reunir mascotas con sus familias',
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.signingIn': 'Iniciando sesión...',
    'auth.creatingAccount': 'Creando cuenta...',
    'auth.checkEmail': 'Revisa tu correo',
    'auth.confirmationSent': 'Te hemos enviado un enlace de confirmación para completar tu registro.',
    'auth.welcomeBack': '¡Bienvenido de vuelta!',
    'auth.signedInSuccess': 'Has iniciado sesión exitosamente.',
    'auth.error': 'Error',
    'auth.signOut': 'Salir',
    
    // Forms
    'form.title': 'Título',
    'form.species': 'Especie',
    'form.breed': 'Raza',
    'form.description': 'Descripción',
    'form.location': 'Ubicación',
    'form.contact': 'Contacto',
    'form.whatsapp': 'WhatsApp',
    'form.phone': 'Teléfono',
    'form.email': 'Correo',
    'form.images': 'Imágenes',
    'form.submit': 'Enviar',
    'form.cancel': 'Cancelar',
    
    // Species
    'species.dogs': 'Perros',
    'species.cats': 'Gatos',
    'species.birds': 'Aves',
    'species.rodents': 'Roedores',
    'species.fish': 'Peces',
    'species.dog': 'Perro',
    'species.cat': 'Gato',
    'species.bird': 'Ave',
    'species.rodent': 'Roedor',
    
    // Status
    'status.lost': 'Perdida',
    'status.reported': 'Reportada',
    'status.active': 'Activa',
    'status.resolved': 'Resuelta',
    'status.seen': 'Visto',
    'status.injured': 'Herido',
    'status.sick': 'Enfermo',
    'status.dead': 'Sin vida',
    'status.other': 'Otro',
    
    // Actions
    'action.search': 'Buscar',
    'action.filter': 'Filtrar',
    'action.report': 'Reportar',
    'action.markResolved': 'Marcar como Resuelta',
    'action.edit': 'Editar',
    'action.delete': 'Eliminar',
    // clave que usa Veterinarians
    'action.addVeterinarian': 'Publicar veterinario',
    
    // Disclaimers
    'disclaimer.animalSales': 'ESTÁ PROHIBIDO USAR ESTA SECCIÓN PARA VENDER ANIMALES.',
    'disclaimer.platform': 'Esta plataforma es colaborativa; se recomienda reunirse en lugares públicos y seguros.',
    'disclaimer.privacy': 'Privacidad por defecto: evita direcciones exactas, placas de matrícula o rostros de menores.',

    // Pagination
    'pagination.previous': 'Anterior',
    'pagination.next': 'Siguiente',
    'pagination.page': 'Página',

    // Common (algunas pantallas usan common.previous/common.next)
    'common.previous': 'Anterior',
    'common.next': 'Siguiente',

    // Empty states
    'empty.noVets': 'No hay veterinarios disponibles',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.reported': 'Reported Pets',
    'nav.lost': 'Lost Pets',
    'nav.marketplace': 'Buy & Sell',
    'nav.veterinarians': 'Veterinarians',
    'nav.adoptions': 'Adoptions',
    'nav.support': 'Support',
    'nav.dashboard': 'Account data',
    'nav.saved': 'Saved',
    'nav.profile': 'Profile',
    
    // Homepage
    'home.welcome': 'Welcome to Pawsi',
    'home.subtitle': 'Help reunite pets with their families',
    'home.animalSighted': 'Animal Sighted',
    'home.animalSightedDesc': 'Report a pet you\'ve seen',
    'home.reportSighting': 'Report Sighting',
    'home.lostPet': 'Lost Pet',
    'home.lostPetDesc': 'Post a missing pet alert',
    'home.postAlert': 'Post Alert',
    'home.adoptions': 'Adoptions',
    'home.buySell': 'Buy & Sell',
    'home.latestNews': 'Latest News',
    // clave que usa Adoptions
    'home.publishAdoption': 'Publish Adoption',
    
    // Authentication
    'auth.welcome': 'Welcome to Pawsi',
    'auth.subtitle': 'Sign in to help reunite pets with their families',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.signingIn': 'Signing in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.checkEmail': 'Check your email',
    'auth.confirmationSent': 'We\'ve sent you a confirmation link to complete your registration.',
    'auth.welcomeBack': 'Welcome back!',
    'auth.signedInSuccess': 'You\'ve been successfully signed in.',
    'auth.error': 'Error',
    'auth.signOut': 'Sign out',
    
    // Forms
    'form.title': 'Title',
    'form.species': 'Species',
    'form.breed': 'Breed',
    'form.description': 'Description',
    'form.location': 'Location',
    'form.contact': 'Contact',
    'form.whatsapp': 'WhatsApp',
    'form.phone': 'Phone',
    'form.email': 'Email',
    'form.images': 'Images',
    'form.submit': 'Submit',
    'form.cancel': 'Cancel',
    
    // Species
    'species.dogs': 'Dogs',
    'species.cats': 'Cats',
    'species.birds': 'Birds',
    'species.rodents': 'Rodents',
    'species.fish': 'Fish',
    'species.dog': 'Dog',
    'species.cat': 'Cat',
    'species.bird': 'Bird',
    'species.rodent': 'Rodent',
    
    // Status
    'status.lost': 'Lost',
    'status.reported': 'Reported',
    'status.active': 'Active',
    'status.resolved': 'Resolved',
    'status.seen': 'Seen',
    'status.injured': 'Injured',
    'status.sick': 'Sick',
    'status.dead': 'Deceased',
    'status.other': 'Other',
    
    // Actions
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.report': 'Report',
    'action.markResolved': 'Mark as Resolved',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    // clave que usa Veterinarians
    'action.addVeterinarian': 'Add Veterinarian',
    
    // Disclaimers
    'disclaimer.animalSales': 'IT IS FORBIDDEN TO USE THIS SECTION TO SELL ANIMALS.',
    'disclaimer.platform': 'This platform is collaborative; meeting in safe, public places is recommended.',
    'disclaimer.privacy': 'Privacy by default: avoid exact addresses, license plates, or faces of minors.',

    // Pagination
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    'pagination.page': 'Page',

    // Common
    'common.previous': 'Previous',
    'common.next': 'Next',

    // Empty states
    'empty.noVets': 'No veterinarians available',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.reported': 'Animais Reportados',
    'nav.lost': 'Animais Perdidos',
    'nav.marketplace': 'Compra e Venda',
    'nav.veterinarians': 'Veterinários',
    'nav.adoptions': 'Adoções',
    'nav.support': 'Suporte',
    'nav.dashboard': 'Dados da conta',
    'nav.saved': 'Salvos',
    'nav.profile': 'Perfil',

    // Homepage
    'home.welcome': 'Bem-vindo ao Pawsi',
    'home.subtitle': 'Ajude a reunir pets com suas famílias',
    'home.animalSighted': 'Animal Avistado',
    'home.animalSightedDesc': 'Reporte um pet que você viu',
    'home.reportSighting': 'Reportar Avistamento',
    'home.lostPet': 'Pet Perdido',
    'home.lostPetDesc': 'Publique um alerta de pet perdido',
    'home.postAlert': 'Publicar Alerta',
    'home.adoptions': 'Adoções',
    'home.buySell': 'Compra e Venda',
    'home.latestNews': 'Últimas Notícias',
    // clave que usa Adoptions
    'home.publishAdoption': 'Publicar Adoção',

    // Authentication
    'auth.welcome': 'Bem-vindo ao Pawsi',
    'auth.subtitle': 'Entre para ajudar a reunir pets com suas famílias',
    'auth.signIn': 'Entrar',
    'auth.signUp': 'Criar Conta',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.signingIn': 'Entrando...',
    'auth.creatingAccount': 'Criando conta...',
    'auth.checkEmail': 'Verifique seu email',
    'auth.confirmationSent': 'Enviamos um link de confirmação para concluir seu cadastro.',
    'auth.welcomeBack': 'Bem-vindo de volta!',
    'auth.signedInSuccess': 'Você entrou com sucesso.',
    'auth.error': 'Erro',
    'auth.signOut': 'Sair',

    // Forms
    'form.title': 'Título',
    'form.species': 'Espécie',
    'form.breed': 'Raça',
    'form.description': 'Descrição',
    'form.location': 'Localização',
    'form.contact': 'Contato',
    'form.whatsapp': 'WhatsApp',
    'form.phone': 'Telefone',
    'form.email': 'Email',
    'form.images': 'Imagens',
    'form.submit': 'Enviar',
    'form.cancel': 'Cancelar',

    // Species
    'species.dogs': 'Cães',
    'species.cats': 'Gatos',
    'species.birds': 'Aves',
    'species.rodents': 'Roedores',
    'species.fish': 'Peixes',
    'species.dog': 'Cão',
    'species.cat': 'Gato',
    'species.bird': 'Ave',
    'species.rodent': 'Roedor',

    // Status
    'status.lost': 'Perdido',
    'status.reported': 'Reportado',
    'status.active': 'Ativo',
    'status.resolved': 'Resolvido',
    'status.seen': 'Visto',
    'status.injured': 'Ferido',
    'status.sick': 'Doente',
    'status.dead': 'Sem vida',
    'status.other': 'Outro',

    // Actions
    'action.search': 'Pesquisar',
    'action.filter': 'Filtrar',
    'action.report': 'Denunciar',
    'action.markResolved': 'Marcar como Resolvido',
    'action.edit': 'Editar',
    'action.delete': 'Excluir',
    // clave que usa Veterinarians
    'action.addVeterinarian': 'Publicar veterinário',

    // Disclaimers
    'disclaimer.animalSales': 'É PROIBIDO USAR ESTA SEÇÃO PARA VENDER ANIMAIS.',
    'disclaimer.platform': 'Esta plataforma é colaborativa; recomenda-se se encontrar em locais públicos e seguros.',
    'disclaimer.privacy': 'Privacidade por padrão: evite endereços exatos, placas de veículos ou rostos de menores.',

    // Pagination
    'pagination.previous': 'Anterior',
    'pagination.next': 'Próximo',
    'pagination.page': 'Página',

    // Common
    'common.previous': 'Anterior',
    'common.next': 'Próximo',

    // Empty states
    'empty.noVets': 'Não há veterinários disponíveis',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es'); // Default to Spanish

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

