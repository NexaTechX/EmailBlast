import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                EmailBlast ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our email marketing platform. 
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-medium mb-2 mt-4">Personal Data</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may collect personally identifiable information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Register for an account</li>
                <li>Subscribe to our newsletter</li>
                <li>Fill out a form</li>
                <li>Contact us for support</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                This information may include: name, email address, company name, phone number, billing information, 
                and any other information you choose to provide.
              </p>

              <h3 className="text-lg font-medium mb-2 mt-4">Subscriber Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you use our Service to send emails, you upload subscriber lists and create email content. 
                We collect and store this data on your behalf to provide the Service. You remain the data controller 
                of your subscriber data, and we act as a data processor.
              </p>

              <h3 className="text-lg font-medium mb-2 mt-4">Usage Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We automatically collect certain information when you use our Service, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent</li>
                <li>Campaign performance metrics (opens, clicks, bounces)</li>
                <li>Referring website addresses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide, operate, and maintain our Service</li>
                <li>Process your transactions and manage your account</li>
                <li>Send you email campaigns on behalf of you to your subscribers</li>
                <li>Provide analytics and reporting on campaign performance</li>
                <li>Improve, personalize, and expand our Service</li>
                <li>Understand and analyze how you use our Service</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you for customer service, updates, and marketing</li>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. How We Share Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may share your information in the following situations:
              </p>
              
              <h3 className="text-lg font-medium mb-2 mt-4">Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed">
                We share your information with third-party service providers who perform services on our behalf, such as:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>Email delivery services (Brevo, SendGrid)</li>
                <li>Payment processors (Stripe)</li>
                <li>Cloud hosting providers (Supabase, AWS)</li>
                <li>Analytics providers</li>
              </ul>

              <h3 className="text-lg font-medium mb-2 mt-4">Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose your information if required to do so by law or in response to valid requests by 
                public authorities (e.g., a court or government agency).
              </p>

              <h3 className="text-lg font-medium mb-2 mt-4">Business Transfers</h3>
              <p className="text-muted-foreground leading-relaxed">
                If we are involved in a merger, acquisition, or sale of assets, your information may be transferred 
                as part of that transaction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide you with our Service and as 
                described in this Privacy Policy. We will retain and use your information to the extent necessary to 
                comply with our legal obligations, resolve disputes, and enforce our agreements. When you delete your 
                account, we will delete your personal data and subscriber data within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use administrative, technical, and physical security measures to protect your personal information. 
                Our security measures include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and authentication</li>
                <li>Secure data centers with physical security</li>
                <li>Regular backups and disaster recovery plans</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we 
                strive to use commercially acceptable means to protect your information, we cannot guarantee its 
                absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Your Data Protection Rights (GDPR)</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If you are a resident of the European Economic Area (EEA), you have certain data protection rights:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Right to access:</strong> You can request copies of your personal data</li>
                <li><strong>Right to rectification:</strong> You can request correction of inaccurate or incomplete data</li>
                <li><strong>Right to erasure:</strong> You can request deletion of your personal data</li>
                <li><strong>Right to restrict processing:</strong> You can request restriction of processing your data</li>
                <li><strong>Right to data portability:</strong> You can request transfer of your data</li>
                <li><strong>Right to object:</strong> You can object to our processing of your personal data</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                To exercise any of these rights, please contact us using the contact information below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. CCPA Privacy Rights (California Residents)</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If you are a California resident, you have specific rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>The right to know what personal information is collected</li>
                <li>The right to know if personal information is sold or disclosed</li>
                <li>The right to say no to the sale of personal information</li>
                <li>The right to delete personal information</li>
                <li>The right to non-discrimination for exercising your rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our Service. Cookies are files 
                with small amount of data that are sent to your browser from a website and stored on your device. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Email Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service includes email tracking features that allow you to see when your subscribers open emails 
                and click on links. This is accomplished through the use of tracking pixels and tracked links. 
                You must provide clear notice to your subscribers about email tracking in your own privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service may contain links to third-party websites. We have no control over and assume no 
                responsibility for the content, privacy policies, or practices of any third-party sites or services. 
                We strongly advise you to review the privacy policy of every site you visit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for children under the age of 13. We do not knowingly collect personally 
                identifiable information from children under 13. If you are a parent or guardian and you are aware 
                that your child has provided us with personal data, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information, including personal data, may be transferred to and maintained on computers located 
                outside of your state, province, country, or other governmental jurisdiction where the data protection 
                laws may differ. We will take all steps reasonably necessary to ensure that your data is treated 
                securely and in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this 
                Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">15. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Email: privacy@emailblast.com<br />
                Address: [Your Business Address]<br />
                Data Protection Officer: [DPO Contact Information]
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}

