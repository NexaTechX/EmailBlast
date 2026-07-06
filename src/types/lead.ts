export interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  linkedin?: string;
  website?: string;
  industry?: string;
  employees?: string;
  location?: string;
  personalEmail?: string;
  directPhone?: string;
  mobile?: string;
  education?: string;
  previousCompanies?: string[];
  technologies?: string[];
  founded?: string;
  revenue?: string;
  companySize?: string;
  interests?: string[];
  confidenceScore?: number;
}
