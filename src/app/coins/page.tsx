import { Coins, Gift,} from 'lucide-react';
import '@/src/styles/Shop.css'; 

interface CoinsProps {
    amount: string;
    price: string;
    bonus: Number | String | any;

}


/**
 * A page that displays all the available packages of Lunar Coins.
 *
 * @returns The JSX element representing the page.
 */
const LunnarCoins = () => {
  return (
    <div>
    <div className="shop-container">
      <div className="shop-content">
        {/* Shop Header */}
        <header className="shop-header">
          <h1 className="text-4xl md:text-5xl font-bold text-[#fffffe] mb-4">
            Lunna Shop
          </h1>
          <p className="text-[#94a1b2] text-lg max-w-2xl mx-auto">
            Enhance your Lunna experience with premium features and Lunar Coins
          </p>
        </header>

        {/* Main Shop Content */}
        <main className="shop-sections">


          {/* Lunar Coins Packages */}
          <section>
            <h2 className="text-3xl font-bold text-[#fffffe] mb-8 text-center">
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex justify-center">
              <CoinPackage amount="10,000" price="4.99" bonus={500} />
              </div>
              <div className="flex justify-center">
              <CoinPackage amount="50,000" price="9.99" bonus={5000} />
              </div>
              <div className="flex justify-center">
              <CoinPackage amount="100,000" price="17.99" bonus={10500} />
              </div>
              <div className="flex justify-center">
              <CoinPackage amount="250,000" price="34.99" bonus={50000}/>
              </div>
              <div className="flex justify-center">
              <CoinPackage amount="500,000" price="79.99" bonus={100000} />
              </div>
              <div className="flex justify-center">
              <CoinPackage amount="1,000,000" price="149.99" bonus={200000} />
              </div>
              <div className="flex justify-center">
              <CoinPackage amount="5,000,000" price="249.99" bonus={500000} />
              </div>
              <div className="flex justify-center">
              <CoinPackage amount="10,000,000" price="449.99" bonus={750000} />
              </div>
            </div>
          </section>
        </main>
      </div>  
      </div>  
      </div>
  );
};


/**
 * A component to render a coin package.
 * @param {{ amount: string, price: string, bonus: Number | String | any }} props
 * @returns {JSX.Element}
 */
const CoinPackage = ({ amount, price, bonus }: CoinsProps) => (
    <div className="coin-card">
      <div className="icon">
        <Coins className="w-8 h-8 mx-auto" />
      </div>
      <h3>{amount} Lunnar Coins</h3>
      {parseInt(bonus) > 0 && (
        <p className="bonus">+{bonus} Bônus Coins</p>
      )}
      <p className="price">R${price}</p>
      <button>
        <Gift className="w-5 h-5" />
        <h4>Purchase</h4>
      </button>
    </div>
  );

  export default LunnarCoins;
