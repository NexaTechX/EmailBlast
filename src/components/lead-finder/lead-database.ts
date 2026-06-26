import { supabase } from "@/lib/supabase";

// Interface for lead data
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
  // Enriched data
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

// Save leads to the database
export async function saveLeads(
  leads: Lead[],
): Promise<{ success: boolean; error?: any }> {
  try {
    // Format leads for database insertion. `user_id` is omitted so the DB
    // default `auth.user_id()` fills it and RLS passes.
    const formattedLeads = leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      title: lead.title,
      company: lead.company,
      email: lead.email.toLowerCase(),
      phone: lead.phone,
      linkedin: lead.linkedin,
      website: lead.website,
      industry: lead.industry,
      employees: lead.employees,
      location: lead.location,
      personal_email: lead.personalEmail,
      direct_phone: lead.directPhone,
      mobile: lead.mobile,
      education: lead.education,
      previous_companies: lead.previousCompanies,
      technologies: lead.technologies,
      founded: lead.founded,
      revenue: lead.revenue,
      company_size: lead.companySize,
      interests: lead.interests,
      confidence_score: lead.confidenceScore,
    }));

    // Insert leads into the database
    const { error } = await supabase.from("leads").upsert(formattedLeads, {
      onConflict: "user_id,email",
      ignoreDuplicates: false,
    });

    if (error) {
      console.error("Error saving leads to database:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in saveLeads:", error);
    return { success: false, error };
  }
}

// Get leads from the database
export async function getLeads(): Promise<{ leads: Lead[]; error?: any }> {
  try {
    // Check if the leads table exists
    const { error: tableCheckError } = await supabase
      .from("leads")
      .select("count")
      .limit(1);

    // If the table doesn't exist, return empty array
    if (tableCheckError && tableCheckError.code === "42P01") {
      return { leads: [] };
    }

    // Get leads from the database
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting leads from database:", error);
      return { leads: [], error };
    }

    // Format leads for the application
    const formattedLeads: Lead[] = data.map((lead) => ({
      id: lead.id,
      name: lead.name,
      title: lead.title,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      linkedin: lead.linkedin,
      website: lead.website,
      industry: lead.industry,
      employees: lead.employees,
      location: lead.location,
      personalEmail: lead.personal_email,
      directPhone: lead.direct_phone,
      mobile: lead.mobile,
      education: lead.education,
      previousCompanies: lead.previous_companies,
      technologies: lead.technologies,
      founded: lead.founded,
      revenue: lead.revenue,
      companySize: lead.company_size,
      interests: lead.interests,
      confidenceScore: lead.confidence_score,
    }));

    return { leads: formattedLeads };
  } catch (error) {
    console.error("Error in getLeads:", error);
    return { leads: [], error };
  }
}

// Search leads in the database
export async function searchLeads(
  query: string,
): Promise<{ leads: Lead[]; error?: any }> {
  try {
    // Check if the leads table exists
    const { error: tableCheckError } = await supabase
      .from("leads")
      .select("count")
      .limit(1);

    // If the table doesn't exist, return empty array
    if (tableCheckError && tableCheckError.code === "42P01") {
      return { leads: [] };
    }

    // Search leads in the database
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .or(
        `name.ilike.%${query}%,` +
          `company.ilike.%${query}%,` +
          `title.ilike.%${query}%,` +
          `industry.ilike.%${query}%,` +
          `location.ilike.%${query}%`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching leads in database:", error);
      return { leads: [], error };
    }

    // Format leads for the application
    const formattedLeads: Lead[] = data.map((lead) => ({
      id: lead.id,
      name: lead.name,
      title: lead.title,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      linkedin: lead.linkedin,
      website: lead.website,
      industry: lead.industry,
      employees: lead.employees,
      location: lead.location,
      personalEmail: lead.personal_email,
      directPhone: lead.direct_phone,
      mobile: lead.mobile,
      education: lead.education,
      previousCompanies: lead.previous_companies,
      technologies: lead.technologies,
      founded: lead.founded,
      revenue: lead.revenue,
      companySize: lead.company_size,
      interests: lead.interests,
      confidenceScore: lead.confidence_score,
    }));

    return { leads: formattedLeads };
  } catch (error) {
    console.error("Error in searchLeads:", error);
    return { leads: [], error };
  }
}
