export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: "newsletter" | "promotional" | "transactional" | "announcement";
  thumbnail: string;
  html: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "A warm welcome message for new subscribers",
    category: "transactional",
    thumbnail: "🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;">
          <h1 style="margin: 0; font-size: 32px;">Welcome to Our Community! 🎉</h1>
          <p style="margin: 20px 0 0; font-size: 18px; opacity: 0.9;">We're thrilled to have you here</p>
        </div>
        <div style="padding: 40px 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi there,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for joining us! We're excited to share valuable content, exclusive updates, and special offers with you.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Here's what you can expect from us:
          </p>
          <ul style="font-size: 16px; line-height: 1.8; color: #333;">
            <li>Regular updates and insights</li>
            <li>Exclusive offers and early access</li>
            <li>Helpful tips and resources</li>
          </ul>
          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: "newsletter",
    name: "Newsletter Template",
    description: "Clean newsletter design for regular updates",
    category: "newsletter",
    thumbnail: "📰",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <div style="background: white; padding: 30px; border-bottom: 4px solid #3b82f6;">
          <h1 style="margin: 0; color: #1f2937; font-size: 28px;">Your Monthly Update</h1>
          <p style="margin: 10px 0 0; color: #6b7280;">Stay informed with our latest news and insights</p>
        </div>
        <div style="padding: 40px 30px; background: white; margin-top: 2px;">
          <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 15px;">Featured Story</h2>
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px;">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read More →</a>
        </div>
        <div style="padding: 30px; background: white; margin-top: 2px;">
          <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 15px;">Quick Links</h3>
          <div style="display: grid; gap: 15px;">
            <a href="#" style="display: block; padding: 15px; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #1f2937; transition: background 0.2s;">
              <strong>Article Title 1</strong>
              <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Brief description of the article</p>
            </a>
            <a href="#" style="display: block; padding: 15px; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #1f2937;">
              <strong>Article Title 2</strong>
              <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">Brief description of the article</p>
            </a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: "promotional",
    name: "Promotional Sale",
    description: "Eye-catching design for sales and promotions",
    category: "promotional",
    thumbnail: "🎁",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fef3c7;">
        <div style="text-align: center; padding: 50px 20px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
          <h1 style="margin: 0; font-size: 36px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">SPECIAL OFFER!</h1>
          <p style="margin: 15px 0; font-size: 24px; color: white; font-weight: bold;">50% OFF</p>
          <p style="margin: 0; font-size: 18px; color: white;">Limited Time Only</p>
        </div>
        <div style="padding: 40px 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333; text-align: center;">
            Don't miss out on this amazing deal! Get <strong>50% off</strong> on all our products for the next 48 hours.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display: inline-block; padding: 18px 50px; background: #f59e0b; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">SHOP NOW</a>
          </div>
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 20px 0 0;">
            Offer expires in 48 hours. Terms and conditions apply.
          </p>
        </div>
      </div>
    `,
  },
  {
    id: "announcement",
    name: "Product Launch",
    description: "Announce new products or features",
    category: "announcement",
    thumbnail: "🚀",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 60px 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px;">Introducing Our Latest Innovation</h1>
          <p style="margin: 20px 0 0; font-size: 18px; opacity: 0.9;">The future is here</p>
        </div>
        <div style="padding: 40px 30px; background: white;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            We're excited to announce the launch of our revolutionary new product that will change the way you work.
          </p>
          <div style="margin: 30px 0; padding: 30px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #6366f1;">
            <h3 style="margin: 0 0 15px; color: #1f2937;">Key Features:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
              <li>Feature 1: Amazing capability</li>
              <li>Feature 2: Incredible performance</li>
              <li>Feature 3: Seamless integration</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display: inline-block; padding: 15px 40px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Learn More</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Simple and elegant design for any purpose",
    category: "newsletter",
    thumbnail: "✨",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 28px; font-weight: 300; color: #1f2937; margin: 0 0 20px; letter-spacing: -0.5px;">Hello,</h1>
        <p style="font-size: 16px; line-height: 1.8; color: #4b5563; margin: 0 0 20px;">
          This is a clean, minimal template perfect for straightforward communication. The focus is on your message, not distracting design elements.
        </p>
        <p style="font-size: 16px; line-height: 1.8; color: #4b5563; margin: 0 0 30px;">
          Use this template when you want your words to take center stage.
        </p>
        <a href="#" style="display: inline-block; padding: 12px 30px; border: 2px solid #1f2937; color: #1f2937; text-decoration: none; font-weight: 500; transition: all 0.2s;">Take Action</a>
        <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #9ca3af; margin: 0;">Best regards,<br>Your Team</p>
        </div>
      </div>
    `,
  },
  {
    id: "event",
    name: "Event Invitation",
    description: "Invite subscribers to events and webinars",
    category: "announcement",
    thumbnail: "📅",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
        <div style="padding: 40px 30px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">You're Invited!</h1>
          <p style="margin: 15px 0 0; font-size: 18px; opacity: 0.9;">Join us for an exclusive event</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px;">Event Details</h2>
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0 0 15px; color: #4b5563;"><strong>📅 Date:</strong> January 15, 2024</p>
            <p style="margin: 0 0 15px; color: #4b5563;"><strong>🕐 Time:</strong> 2:00 PM - 4:00 PM EST</p>
            <p style="margin: 0; color: #4b5563;"><strong>📍 Location:</strong> Online Webinar</p>
          </div>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Join industry experts as they share insights on the latest trends and best practices. This is a unique opportunity to learn and network with peers.
          </p>
          <div style="text-align: center;">
            <a href="#" style="display: inline-block; padding: 15px 50px; background: #ec4899; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.3);">Register Now</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: "testimonial",
    name: "Customer Story",
    description: "Share customer testimonials and success stories",
    category: "newsletter",
    thumbnail: "⭐",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 40px 30px; background: white;">
          <h1 style="color: #1f2937; margin: 0 0 30px; font-size: 28px;">Customer Success Story</h1>
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <div style="margin-bottom: 20px;">
              <span style="color: #fbbf24; font-size: 24px;">★★★★★</span>
            </div>
            <p style="font-size: 18px; font-style: italic; color: #1f2937; line-height: 1.6; margin: 0 0 20px;">
              "This product completely transformed the way we work. Our productivity increased by 200% and our team couldn't be happier!"
            </p>
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="width: 50px; height: 50px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">JD</div>
              <div>
                <p style="margin: 0; font-weight: bold; color: #1f2937;">John Doe</p>
                <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">CEO, Tech Company</p>
              </div>
            </div>
          </div>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            Want to achieve similar results? Join thousands of satisfied customers who have transformed their business with our solution.
          </p>
          <div style="text-align: center;">
            <a href="#" style="display: inline-block; padding: 15px 40px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Your Free Trial</a>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: "tips",
    name: "Tips & Tricks",
    description: "Educational content and helpful tips",
    category: "newsletter",
    thumbnail: "💡",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
        <div style="padding: 40px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
          <h1 style="margin: 0; font-size: 28px;">💡 Pro Tips</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Expert advice to level up your game</p>
        </div>
        <div style="padding: 40px 30px;">
          <div style="margin-bottom: 30px; padding: 25px; background: #f0fdf4; border-radius: 8px; border: 2px solid #10b981;">
            <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px;">Tip #1: Start Small</h3>
            <p style="margin: 0; color: #047857; line-height: 1.6;">
              Don't try to do everything at once. Focus on one improvement at a time for best results.
            </p>
          </div>
          <div style="margin-bottom: 30px; padding: 25px; background: #f0fdf4; border-radius: 8px; border: 2px solid #10b981;">
            <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px;">Tip #2: Consistency is Key</h3>
            <p style="margin: 0; color: #047857; line-height: 1.6;">
              Regular practice beats occasional perfection. Make it a daily habit.
            </p>
          </div>
          <div style="margin-bottom: 30px; padding: 25px; background: #f0fdf4; border-radius: 8px; border: 2px solid #10b981;">
            <h3 style="margin: 0 0 15px; color: #065f46; font-size: 18px;">Tip #3: Measure Progress</h3>
            <p style="margin: 0; color: #047857; line-height: 1.6;">
              Track your improvements to stay motivated and identify what works best.
            </p>
          </div>
          <div style="text-align: center; padding: 30px 0;">
            <a href="#" style="display: inline-block; padding: 15px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Learn More Tips</a>
          </div>
        </div>
      </div>
    `,
  },
];

export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(template => template.id === id);
}

export function getTemplatesByCategory(category: EmailTemplate["category"]): EmailTemplate[] {
  return emailTemplates.filter(template => template.category === category);
}

