

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  placeOfBirth: string;
  residence: string;
  linkedin: string;
  website: string;
  github: string;
  twitter: string;
  photo: string;
  socialLinks: SocialLink[];
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;

  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  date: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  link: string;
  imageUrl: string;
  description: string;
}

export interface CVData {
  personal: PersonalDetails;
  experience: Experience[];
  education: Education[];
  skills: string;
  projects: Project[];
  certifications: Certification[];
  portfolio: PortfolioItem[];
  professionalNarrative: string;
  videoUrl: string;
  signature: string;
}

// FIX: Removed 'info' from SectionId as it is not a valid draggable CV section and was causing a type error.
export type SectionId = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'portfolio' | 'professionalNarrative' | 'jobSearch' | 'coverLetter' | 'signature';

export type CVDataFromAI = Omit<CVData, 'experience' | 'education' | 'projects' | 'certifications' | 'portfolio'> & {
    experience: Omit<Experience, 'id'>[];
    education: Omit<Education, 'id'>[];
    projects: Omit<Project, 'id'>[];
    certifications: Omit<Certification, 'id'>[];
    portfolio: Omit<PortfolioItem, 'id'>[];
}

export interface CompanyInfo {
  name: string;
  careersUrl: string;
}

export interface JobSuggestion {
  jobTitle: string;
  companies: CompanyInfo[];
}