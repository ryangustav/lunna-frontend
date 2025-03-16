import { Shield, Lock, Eye, Database, Bell, Clock, UserCheck, HelpCircle, Coins, Scale } from 'lucide-react';
import '@/src/styles/Privacy.css';

const PrivacyPolicy = () => {
  return (
    <div>
    <div className="privacy-container">
      <div className="privacy-content">
        {/* Header */}
        <div className="privacy-header">
          <Shield className="w-16 h-16 mx-auto" />
          <h1>Privacy Policy</h1>
          <p>Last updated: February 17, 2025</p>
        </div>

        {/* Introduction */}
        <section className="privacy-sections">
          <p className="mb-4">
            Resume: You take responsibility for any image/video/audio/media sent to me, trying to abuse bugs/use bots/cheats is prohibited and you may lose access to all my features (and other services), we will collect information such as your ID, username, email, IP, avatar, servers, messages, media and other things (but we will not distribute such information to third parties), you will not defame/harm the image of Lunna, Onlykgzin, you may be suspended from using Lunna or any other service for any reason, that you will not be able to recover data if it is lost, and that you agree to everything that is in the terms of use.
          </p>
        </section>

        {/* Policy Sections */}
        <div className="privacy-section">
          {/* Information Collection */}
          <section>
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
                <Database className="w-6 h-6 text-[#7f5af0]" />
                Information We Collect
             </h2>
            </div>
            <div className="pl-6 space-y-4">
              <p>We collect the following information when you use Lunna:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Discord User ID and Username</li>
                <li>Email</li>
                <li>IP</li>
                <li>Servidores</li>
                <li>Avatar</li>
                <li>Mensagens & Media</li>
                <li>Transaction Information (for premium features)</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="privacy-section">
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <Eye className="w-6 h-6 text-[#7f5af0]" />
              How We Use Your Information</h2>
            </div>
            <div className="pl-6 space-y-4">
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Providing and maintaining our services</li>
                <li>Processing transactions</li>
                <li>Responding to user inquiries and support requests</li>
                <li>Improving our services and user experience</li>
                <li>Sending important updates and notifications</li>
              </ul>
            </div>
          </section>

          {/*Virtual Currency*/}
          <section className="privacy-section">
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <Coins className="w-6 h-6 text-[#7f5af0]" />
              Virtual Currency and Virtual Goods</h2>
            </div>
            <div className="pl-6 space-y-4">
              <p>The Service may offer the opportunity to acquire virtual currency (&quot;Virtual Currency&quot;) or virtual goods (&quot;Virtual Goods&quot;), which may require payment of a fee using legal tender (&quot;real money&quot;). All purchases of Virtual Currency are final and non-refundable, non-exchangeable, and non-transferable, except at the sole discretion of the Company or the platform provider. The purchase, sale, or exchange of Virtual Currency outside the Service is strictly prohibited. Any violation of this provision may result in the termination of your Account and/or legal action.</p>
              <p>The Company reserves the right, at its sole discretion, to modify, manage, regulate, or remove Virtual Currency and/or Virtual Goods at any time. Prices and availability of Virtual Goods are subject to change without prior notice. The Company shall not be liable to you or any third party for the exercise of these rights.</p>
              <p>You are granted a limited, personal, non-transferable, and non-sublicensable license to use Virtual Goods and Virtual Currency solely within the Service, provided that they have been earned, purchased, or otherwise obtained in a manner authorized by the Company. You acknowledge that you have no ownership rights, title, or interest in any Virtual Goods or Virtual Currency made available through the Service.</p>
              <p>In the event of a chargeback, the Company reserves the right to issue a warning regarding the violation or to immediately suspend or terminate any and all Accounts associated with your use of the Service. Additionally, the Company may, at its discretion, suspend or terminate other accounts linked to you across different services.</p>
            </div>
          </section>


          {/* Data Protection */}
          <section>
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <Lock className="w-6 h-6 text-[#7f5af0]" />
              Data Protection</h2>
            </div>
            <div className="pl-6">
              <p className="mb-4">
              All data can only be accessed by Ryan (Onlykgzin), which agreed to not share/sell/distribute any of the stored data with third parties.
              </p>
            </div>
          </section>

          {/* User Rights */}
          <section>
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-[#7f5af0]" />
              Your Rights</h2>
            </div>
            <div className="pl-6 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Opt-out of non-essential data collection</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#7f5af0]" />
              Data Retention</h2>
            </div>
            <div className="pl-6">
              <p className="mb-4">
                We retain your personal information only for as long as necessary to fulfill the 
                purposes outlined in this Privacy Policy and to comply with legal obligations.
              </p>
            </div>
          </section>

          {/*Limitation of Liability*/}
          <section className="privacy-section">
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <Scale className="w-6 h-6 text-[#7f5af0]" />
              Limitation of Liability</h2>
            </div>
            <div className="pl-6 space-y-4">
              <p>To the maximum extent permitted by law, under no circumstances shall the Company be liable to you or any third party for any consequential, incidental, special, punitive, or other indirect damages, including but not limited to lost profits or lost data, arising from your use of the Service or any materials accessed through or downloaded from the Service. This applies regardless of whether such claims are based on warranty, contract, tort, or any other legal theory, and whether or not the Company has been advised of the possibility of such damages.</p>
              <p>The Company&apos;s total liability to you shall not exceed the greater of: (a) the total amount you have paid to the Company under these Terms in the three (3) months immediately preceding the date on which you first assert a claim, or (b) $100.</p>
              <p>The limitations and disclaimers set forth in these Terms do not seek to exclude liability or alter rights that cannot be lawfully excluded under applicable law. Certain jurisdictions do not permit the exclusion of implied warranties or the limitation of liability for incidental or consequential damages. In such jurisdictions, the Company&apos;s liability shall be limited to the maximum extent permitted by law.</p>
              <p>You expressly acknowledge that the Company shall not be responsible for user-generated content, including, but not limited to, Your Content, or for any defamatory, offensive, or illegal conduct of any third party. The risk of harm or damage arising from such content or conduct shall rest entirely with you.</p>
            </div>
          </section>


          {/* Disclaimer of Warranty */}
          <section>
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <Bell className="w-6 h-6 text-[#7f5af0]" />
              Disclaimer of Warranty</h2>
            </div>
            <div className="pl-6">
              <p className="mb-4">
              The Services and the Service Materials are provided &quot;as is&quot; without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. Furthermore, while the Company endeavors to provide a positive user experience, we cannot and do not warrant that the Services will always be secure, error-free, or that the Services will function without delays, disruptions, or imperfections. The foregoing disclaimers shall apply to the fullest extent permitted by applicable law.
              </p>
            </div>
          </section>

          {/*Acknowledgement*/}
          <section className="privacy-section">
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <Eye className="w-6 h-6 text-[#7f5af0]" />
              Acknowledgement</h2>
            </div>
            <div className="pl-6 space-y-4">
              <p>Usage of any of our services affirms that the Licensee has read this Agreement, understands it, and agrees to be bound by its contents.</p>
            </div>
          </section>


          {/* Updates to Policy */}
          <section>
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <Bell className="w-6 h-6 text-[#7f5af0]" />
              Updates to This Policy</h2>
            </div>
            <div className="pl-6">
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify users of any 
                material changes through our Discord bot or website.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-[#fffffe] flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-[#7f5af0]" />
              Contact Us</h2>
            </div>
            <div className="pl-6">
              <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us through:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><a className='nav-link' href="https://discord.gg/DaUhFcjJfH" target='_blank'>Our Discord Support Server</a></li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PrivacyPolicy;