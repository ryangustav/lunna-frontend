"use client"

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  CreditCard, 
  QrCode, 
  Barcode, 
  ArrowLeft, 
  Check, 
  Copy, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "@/src/i18n/routing";
import { Navbar } from "@/components/lunna/navbar";
import { API_URL } from "@/lib/api";

interface ItemDetails {
  name: string;
  price: number;
  description: string;
  benefits: string[];
}

const getToken = () => {
  if (typeof document === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  
  const type = searchParams.get('type') || ''; // 'VIP' | 'COINS'
  const itemId = searchParams.get('id') || ''; // tierId or packageId
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [publicKey, setPublicKey] = useState<string>('');
  const [mpInstance, setMpInstance] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [pollIntervalId, setPollIntervalId] = useState<any>(null);
  
  // Pix / Boleto Response Data
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string; paymentId: string; transactionId: string } | null>(null);
  const [boletoData, setBoletoData] = useState<{ barcode: string; pdfUrl: string; paymentId: string } | null>(null);
  const [timer, setTimer] = useState<number>(600); // 10 minutes

  // Form Inputs
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [cardBrand, setCardBrand] = useState<string>('');
  
  // Address Inputs (Boleto)
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const [copied, setCopied] = useState(false);

  // Load Mercado Pago SDK and configurations
  useEffect(() => {
    const initConfigs = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError(locale === 'pt' ? 'Por favor faça login com o Discord primeiro.' : 'Please login to your Discord account first.');
          setLoading(false);
          return;
        }

        // Fetch MP Config (Public Key)
        const configRes = await fetch(`${API_URL}/payments/config`);
        if (!configRes.ok) throw new Error('Failed to load payment config');
        const configData = await configRes.json();
        
        if (configData.publicKey) {
          setPublicKey(configData.publicKey);
          // Dynamically load Mercado Pago SDK v2
          if (!window.document.getElementById('mp-sdk-script')) {
            const script = window.document.createElement('script');
            script.id = 'mp-sdk-script';
            script.src = 'https://sdk.mercadopago.com/js/v2';
            script.async = true;
            script.onload = () => {
              const mp = new (window as any).MercadoPago(configData.publicKey);
              setMpInstance(mp);
            };
            window.document.body.appendChild(script);
          } else if ((window as any).MercadoPago) {
            const mp = new (window as any).MercadoPago(configData.publicKey);
            setMpInstance(mp);
          }
        }

        // Fetch product information
        if (type === 'VIP') {
          const tiersRes = await fetch(`${API_URL}/vip/tiers`);
          if (!tiersRes.ok) throw new Error('Failed to fetch tiers');
          const tiersData = await tiersRes.json();
          const list = Array.isArray(tiersData) ? tiersData : tiersData.data || [];
          const selected = list.find((t: any) => t.id === itemId);
          if (selected) {
            setItem({
              name: `Plano VIP ${selected.name}`,
              price: selected.price,
              description: `Acesso VIP por ${selected.duration} dias com ${selected.coins} Lunar Coins inclusas.`,
              benefits: selected.benefits || []
            });
          } else {
            throw new Error('VIP tier not found');
          }
        } else if (type === 'COINS') {
          const coinsRes = await fetch(`${API_URL}/coins/packages`);
          if (!coinsRes.ok) throw new Error('Failed to fetch packages');
          const coinsData = await coinsRes.json();
          const list = Array.isArray(coinsData) ? coinsData : coinsData.data || [];
          const selected = list.find((p: any) => p.id === itemId);
          if (selected) {
            setItem({
              name: `${selected.amount.toLocaleString()} Lunar Coins`,
              price: selected.price,
              description: `Pacote contendo ${selected.amount.toLocaleString()} moedas com +${selected.bonus.toLocaleString()} de bônus coins.`,
              benefits: [
                `${selected.amount.toLocaleString()} Lunar Coins`,
                `+${selected.bonus.toLocaleString()} Moedas de Bônus inclusas`,
                'Crédito automático imediato',
                'Uso liberado em minijogos e cosméticos'
              ]
            });
          } else {
            throw new Error('Coins package not found');
          }
        } else {
          throw new Error('Invalid checkout type');
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading payment details');
      } finally {
        setLoading(false);
      }
    };

    initConfigs();

    return () => {
      if (pollIntervalId) clearInterval(pollIntervalId);
    };
  }, [type, itemId]);

  // Pix timer countdown
  useEffect(() => {
    let interval: any;
    if (pixData && timer > 0 && !success) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setError(locale === 'pt' ? 'O QR Code do Pix expirou. Por favor tente gerar novamente.' : 'Pix QR Code expired. Please generate a new one.');
      setPixData(null);
    }
    return () => clearInterval(interval);
  }, [pixData, timer, success]);

  // CEP Lookup trigger
  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    setZipCode(value.substring(0, 9));

    const raw = value.replace(/\D/g, '');
    if (raw.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // CPF formatter
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(value.substring(0, 14));
  };

  // Card formatting & brand detection
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.startsWith('4')) setCardBrand('visa');
    else if (/^5[1-5]/.test(value) || /^2[2-7]/.test(value)) setCardBrand('mastercard');
    else if (/^(4011|4312|4389|4514|5041|5067|5090|6277|6363)/.test(value)) setCardBrand('elo');
    else if (/^3[47]/.test(value)) setCardBrand('amex');
    else if (/^(6062|3841)/.test(value)) setCardBrand('hipercard');
    else setCardBrand('');

    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    value = value.replace(/(\d{4})(\d)/, '$1 $2');
    setCardNumber(value.substring(0, 19));
  };

  // Expiry formatter
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '$1/$2');
    setCardExpiry(value.substring(0, 5));
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Pix transaction Polling status
  const startPolling = (txId: string) => {
    if (pollIntervalId) clearInterval(pollIntervalId);

    const interval = setInterval(async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/transactions/${txId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.status === 'COMPLETED') {
            setSuccess(true);
            clearInterval(interval);
          } else if (result.success && result.data && result.data.status === 'FAILED') {
            setError(locale === 'pt' ? 'O pagamento foi rejeitado ou expirado.' : 'Payment rejected or expired.');
            setPixData(null);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 4000);

    setPollIntervalId(interval);
  };

  // Handle transparent payment processing
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const token = getToken();
    if (!token) {
      setError('Please login to continue.');
      setSubmitting(false);
      return;
    }

    try {
      let paymentData: any = {
        email,
        cpf: cpf.replace(/\D/g, '')
      };

      if (activeTab === 'pix') {
        paymentData.firstName = firstName;
        paymentData.lastName = lastName;
        
        const res = await fetch(`${API_URL}/transactions/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type,
            itemId,
            paymentMethod: 'pix',
            paymentData
          })
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to process Pix');
        
        setPixData({
          qrCode: data.qrCode,
          qrCodeBase64: data.qrCodeBase64,
          paymentId: data.paymentId,
          transactionId: data.transactionId
        });
        setTimer(600);
        startPolling(data.transactionId);
        
      } else if (activeTab === 'boleto') {
        paymentData.firstName = firstName;
        paymentData.lastName = lastName;
        paymentData.address = {
          zipCode: zipCode.replace(/\D/g, ''),
          street,
          number,
          neighborhood,
          city,
          state
        };

        const res = await fetch(`${API_URL}/transactions/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type,
            itemId,
            paymentMethod: 'boleto',
            paymentData
          })
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to process Boleto');
        
        setBoletoData({
          barcode: data.barcode,
          pdfUrl: data.pdfUrl,
          paymentId: data.paymentId
        });

      } else if (activeTab === 'card') {
        if (!mpInstance) throw new Error('Payment SDK is loading, please try again.');
        
        const [expiryMonth, expiryYear] = cardExpiry.split('/');
        
        try {
          const cardTokenResult = await mpInstance.cardToken.create({
            cardNumber: cardNumber.replace(/\s/g, ''),
            cardholderName: cardHolder,
            cardExpirationMonth: expiryMonth,
            cardExpirationYear: '20' + expiryYear,
            securityCode: cardCvv,
            identificationType: 'CPF',
            identificationNumber: cpf.replace(/\D/g, '')
          });

          if (!cardTokenResult || !cardTokenResult.id) {
            throw new Error('Failed to tokenize credit card. Verify details.');
          }

          paymentData.cardToken = cardTokenResult.id;
          paymentData.paymentMethodId = cardBrand || 'visa';
          paymentData.installments = Number(installments);

          const res = await fetch(`${API_URL}/transactions/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              type,
              itemId,
              paymentMethod: 'card',
              paymentData
            })
          });

          const data = await res.json();
          if (!data.success) throw new Error(data.error || 'Card payment process failed.');

          if (data.status === 'approved') {
            setSuccess(true);
          } else if (data.status === 'in_process') {
            setError(locale === 'pt' ? 'Seu pagamento está em análise. O VIP será ativado assim que compensado.' : 'Payment under review. Check back in a few minutes.');
          } else {
            throw new Error(locale === 'pt' ? `Pagamento recusado: ${data.statusDetail || 'Tente outro cartão.'}` : `Payment rejected: ${data.statusDetail || 'Try another card.'}`);
          }

        } catch (cardErr: any) {
          throw new Error(cardErr.message || 'Tokenization failed');
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit payment details.');
    } finally {
      setSubmitting(false);
    }
  };

  const getBrandLogo = () => {
    switch (cardBrand) {
      case 'visa':
        return 'https://img.icons8.com/color/48/000000/visa.png';
      case 'mastercard':
        return 'https://img.icons8.com/color/48/000000/mastercard.png';
      case 'elo':
        return 'https://img.icons8.com/color/48/000000/elo.png';
      case 'amex':
        return 'https://img.icons8.com/color/48/000000/amex.png';
      case 'hipercard':
        return 'https://img.icons8.com/color/48/000000/hipercard.png';
      default:
        return null;
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">
            {locale === 'pt' ? 'Carregando checkout seguro...' : 'Loading secure checkout...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="mx-auto max-w-[1200px] px-6 py-24 lg:px-8">
        
        {/* Back link */}
        <Button 
          variant="ghost" 
          className="mb-8 p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {locale === 'pt' ? 'Voltar para a loja' : 'Back to shop'}
        </Button>

        {success ? (
          <Card className="mx-auto max-w-lg border-border bg-card text-center p-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-500 bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-2xl font-black tracking-tight">
              {locale === 'pt' ? 'Pagamento Aprovado!' : 'Payment Approved!'}
            </h2>
            <p className="mb-8 text-sm text-muted-foreground">
              {locale === 'pt' 
                ? 'Seus benefícios (status VIP ou moedas) foram creditados com sucesso em sua conta!' 
                : 'Your benefits (VIP status or coins) have been credited successfully to your account!'}
            </p>
            <Button className="w-full font-bold h-12" onClick={() => router.push(type === 'VIP' ? '/vip' : '/coins')}>
              {locale === 'pt' ? 'Voltar para a Loja' : 'Back to Shop'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            
            {/* Purchase Details */}
            <div className="md:col-span-4">
              <Card className="border-border bg-card p-6">
                <h3 className="mb-6 text-lg font-bold tracking-tight border-b border-border pb-4">
                  {locale === 'pt' ? 'Resumo da Compra' : 'Summary'}
                </h3>
                {item && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl font-black tracking-tight">{item.name}</span>
                      <span className="text-lg font-bold text-primary">R$ {item.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    
                    <ul className="space-y-3 pt-6 border-t border-border mt-6">
                      {item.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Zap className="h-4 w-4 shrink-0 text-primary" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-8 pt-6 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  {locale === 'pt' ? 'Ambiente de pagamento criptografado' : 'Encrypted payment checkout'}
                </div>
              </Card>
            </div>

            {/* Checkout Options Form */}
            <div className="md:col-span-8">
              <Card className="border-border bg-card p-6">
                
                {error && (
                  <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-bold text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {pixData ? (
                  <div className="flex flex-col items-center text-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold">{locale === 'pt' ? 'Pix Gerado!' : 'Pix Generated!'}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {locale === 'pt' ? 'Escaneie o QR Code abaixo ou utilize o código Copia e Cola.' : 'Scan the QR code or copy the string to complete the transaction.'}
                    </p>
                    
                    {pixData.qrCodeBase64 && (
                      <div className="bg-white p-3 rounded-xl border border-border shadow-md">
                        <img className="h-48 w-48" src={`data:image/png;base64,${pixData.qrCodeBase64}`} alt="Pix QR Code" />
                      </div>
                    )}
                    
                    <div className="w-full flex items-center justify-between gap-3 bg-secondary rounded-lg border border-border p-3">
                      <span className="text-xs font-mono text-muted-foreground truncate text-left max-w-xs md:max-w-md">{pixData.qrCode}</span>
                      <Button size="sm" className="font-bold shrink-0" onClick={() => copyToClipboard(pixData.qrCode)}>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        {copied ? (locale === 'pt' ? 'Copiado!' : 'Copied!') : (locale === 'pt' ? 'Copiar' : 'Copy')}
                      </Button>
                    </div>
                    
                    <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500 py-1.5 px-4 font-bold text-sm">
                      {locale === 'pt' ? 'Aguardando pagamento: ' : 'Awaiting payment: '} {formatTimer(timer)}
                    </Badge>
                    
                    <p className="text-xs text-muted-foreground max-w-md mt-2">
                      {locale === 'pt' 
                        ? '1. Abra o aplicativo do seu banco.\n2. Escolha Pix > Pagar com QR Code ou Copia e Cola.\n3. O status atualizará automaticamente nesta página assim que aprovado. Não feche a janela.' 
                        : '1. Open your banking application.\n2. Choose Pix > Pay with QR Code or Copia e Cola.\n3. The checkout status will refresh automatically.'}
                    </p>
                    
                    <Button variant="outline" className="mt-4 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => {
                      setPixData(null);
                      if (pollIntervalId) clearInterval(pollIntervalId);
                    }}>
                      {locale === 'pt' ? 'Voltar e escolher outra forma' : 'Cancel and try another method'}
                    </Button>
                  </div>
                ) : boletoData ? (
                  <div className="flex flex-col items-center text-center gap-6 py-4 animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold">{locale === 'pt' ? 'Boleto Gerado!' : 'Boleto Generated!'}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      {locale === 'pt' 
                        ? 'Copie a linha digitável abaixo ou baixe o PDF para pagamento.' 
                        : 'Copy the barcode string or download the PDF to pay.'}
                    </p>
                    
                    <div className="w-full flex items-center justify-between gap-3 bg-secondary rounded-lg border border-border p-3">
                      <span className="text-xs font-mono text-muted-foreground truncate text-left max-w-xs md:max-w-md">{boletoData.barcode}</span>
                      <Button size="sm" className="font-bold shrink-0" onClick={() => copyToClipboard(boletoData.barcode)}>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        {copied ? (locale === 'pt' ? 'Copiado!' : 'Copiar') : (locale === 'pt' ? 'Copiar' : 'Copy')}
                      </Button>
                    </div>

                    <Button className="w-full font-bold max-w-xs" asChild>
                      <a href={boletoData.pdfUrl} target="_blank" rel="noreferrer">
                        {locale === 'pt' ? 'Baixar PDF do Boleto' : 'Download Boleto PDF'}
                      </a>
                    </Button>
                    
                    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 text-xs text-yellow-500 max-w-md text-left leading-relaxed">
                      ⚠️ <strong>{locale === 'pt' ? 'Prazo de Compensação:' : 'Bank Clearing Time:'}</strong> {locale === 'pt' 
                        ? 'A compensação bancária do boleto bancário demora de 1 a 2 dias úteis. Os benefícios serão creditados em sua conta assim que o pagamento for confirmado.' 
                        : 'Boleto payments take 1 to 2 business days to clear. Your benefits will be active as soon as it completes.'}
                    </div>
                    
                    <Button variant="outline" className="mt-4" onClick={() => setBoletoData(null)}>
                      {locale === 'pt' ? 'Voltar' : 'Go Back'}
                    </Button>
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary">
                      <TabsTrigger value="pix" className="font-bold flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        Pix
                      </TabsTrigger>
                      <TabsTrigger value="card" className="font-bold flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {locale === 'pt' ? 'Cartão' : 'Card'}
                      </TabsTrigger>
                      <TabsTrigger value="boleto" className="font-bold flex items-center gap-2">
                        <Barcode className="h-4 w-4" />
                        Boleto
                      </TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleProcessPayment} className="space-y-6">
                      
                      {/* Name fields (Pix/Boleto) */}
                      {(activeTab === 'pix' || activeTab === 'boleto') && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Nome' : 'First Name'}</label>
                            <Input placeholder="Ex: Ryan" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Sobrenome' : 'Last Name'}</label>
                            <Input placeholder="Ex: Gustav" value={lastName} onChange={e => setLastName(e.target.value)} required />
                          </div>
                        </div>
                      )}

                      {/* Email and CPF (ALL) */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">E-mail</label>
                          <Input type="email" placeholder="seu-email@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">CPF</label>
                          <Input placeholder="000.000.000-00" value={cpf} onChange={handleCpfChange} required />
                        </div>
                      </div>

                      {/* Card Details */}
                      {activeTab === 'card' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Nome no Cartão' : 'Cardholder Name'}</label>
                            <Input placeholder="RYAN GUSTAV" value={cardHolder} onChange={e => setCardHolder(e.target.value.toUpperCase())} required />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Número do Cartão' : 'Card Number'}</label>
                            <div className="relative flex items-center">
                              <Input placeholder="0000 0000 0000 0000" className="pr-12" value={cardNumber} onChange={handleCardNumberChange} required />
                              {getBrandLogo() && (
                                <img className="absolute right-3 h-5 w-auto" src={getBrandLogo()!} alt={cardBrand} />
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Validade' : 'Expiry'}</label>
                              <Input placeholder="MM/AA" value={cardExpiry} onChange={handleExpiryChange} required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">CVV</label>
                              <Input placeholder="123" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))} required />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Parcelas' : 'Installments'}</label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={installments} onChange={e => setInstallments(Number(e.target.value))}>
                              <option value={1}>1x de R$ {(item?.price || 0).toFixed(2)} {locale === 'pt' ? '(Sem Juros)' : '(No Interest)'}</option>
                              <option value={2}>2x de R$ {((item?.price || 0) / 2).toFixed(2)}</option>
                              <option value={3}>3x de R$ {((item?.price || 0) / 3).toFixed(2)}</option>
                              <option value={4}>4x de R$ {((item?.price || 0) / 4).toFixed(2)}</option>
                              <option value={5}>5x de R$ {((item?.price || 0) / 5).toFixed(2)}</option>
                              <option value={6}>6x de R$ {((item?.price || 0) / 6).toFixed(2)}</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Address Details (Boleto) */}
                      {activeTab === 'boleto' && (
                        <div className="space-y-4 pt-4 border-t border-border">
                          <h4 className="text-sm font-bold text-foreground">{locale === 'pt' ? 'Endereço de Cobrança' : 'Billing Address'}</h4>
                          
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">CEP</label>
                              <Input placeholder="00000-000" value={zipCode} onChange={handleZipCodeChange} required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Rua / Logradouro' : 'Street'}</label>
                              <Input placeholder="Rua das Nacoes" value={street} onChange={e => setStreet(e.target.value)} required />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Número' : 'Number'}</label>
                              <Input placeholder="123" value={number} onChange={e => setNumber(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Bairro' : 'Neighborhood'}</label>
                              <Input placeholder="Centro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} required />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Cidade' : 'City'}</label>
                              <Input placeholder="São Paulo" value={city} onChange={e => setCity(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-muted-foreground">{locale === 'pt' ? 'Estado (UF)' : 'State'}</label>
                              <Input placeholder="SP" value={state} onChange={e => setState(e.target.value)} required />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pay Button */}
                      <Button type="submit" className="w-full font-bold h-12 flex items-center justify-center gap-2 mt-4" disabled={submitting}>
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {locale === 'pt' ? 'Processando Pagamento...' : 'Processing Payment...'}
                          </>
                        ) : activeTab === 'pix' ? (
                          <>
                            <QrCode className="h-5 w-5" />
                            {locale === 'pt' ? 'Gerar Pix' : 'Generate Pix'}
                          </>
                        ) : activeTab === 'boleto' ? (
                          <>
                            <Barcode className="h-5 w-5" />
                            {locale === 'pt' ? 'Gerar Boleto' : 'Generate Boleto'}
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5" />
                            {locale === 'pt' ? 'Confirmar Pagamento' : 'Confirm Payment'}
                          </>
                        )}
                      </Button>
                    </form>
                  </Tabs>
                )}

              </Card>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Loading secure checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
