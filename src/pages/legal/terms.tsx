import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-6 text-sm">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using EmailBlast ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of the terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Permission is granted to temporarily use the Service for personal or commercial email marketing purposes. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Modify or copy the Service materials</li>
                <li>Use the materials for any commercial purpose without proper subscription</li>
                <li>Attempt to decompile or reverse engineer any software contained in the Service</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Acceptable Use Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You agree not to use EmailBlast to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Send spam, unsolicited emails, or emails to recipients who have not opted in</li>
                <li>Violate any applicable laws or regulations, including CAN-SPAM Act, GDPR, and other data protection laws</li>
                <li>Transmit any harmful code, viruses, or malicious software</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Impersonate any person or entity</li>
                <li>Harvest or collect email addresses or other contact information</li>
                <li>Send phishing, fraudulent, or deceptive messages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account with us, you must provide accurate, complete, and current information. 
                Failure to do so constitutes a breach of the Terms. You are responsible for safeguarding the password 
                and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Subscription Plans</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some parts of the Service are billed on a subscription basis. You will be billed in advance on a 
                recurring and periodic basis. Billing cycles are set on a monthly or annual basis, depending on the 
                subscription plan you select. At the end of each billing cycle, your subscription will automatically 
                renew unless you cancel it or we cancel it.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with the Service 
                within the first 14 days of your subscription, you can request a full refund. After the 14-day period, 
                all charges are non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are and will remain the exclusive 
                property of EmailBlast and its licensors. The Service is protected by copyright, trademark, and other 
                laws of both the United States and foreign countries.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Data and Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy. We take data protection seriously and 
                comply with GDPR, CCPA, and other applicable data protection regulations. You retain all rights to 
                your subscriber data and email content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
                whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use 
                the Service will immediately cease. You may also close your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall EmailBlast, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                be liable for any indirect, incidental, special, consequential or punitive damages, including without 
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access 
                to or use of or inability to access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" 
                basis. The Service is provided without warranties of any kind, whether express or implied, including, 
                but not limited to, implied warranties of merchantability, fitness for a particular purpose, 
                non-infringement or course of performance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of the United States, without 
                regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms 
                will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
                revision is material, we will try to provide at least 30 days notice prior to any new terms taking 
                effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Email: support@emailblast.com<br />
                Address: [Your Business Address]
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}

