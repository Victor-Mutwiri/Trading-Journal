import '../styles/landingpage.css';
import { BarChart3, TrendingUp, Target, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
  return (
    <div className='container'>
      {/* Hero Section */}
      <section className='hero'>
        <div className='heroContent' >
          <h1 className='heroTitle'>
            Track. Reflect. Evolve.
            <br />
            Master Your
            <br />
            Trading Game.
          </h1>
          <p className='heroSubtitle'>
            Your personal Forex trading journal — built to help you grow, strategize, and succeed.
          </p>
          <div className='buttonGroup'>
            <button
            onClick={() => navigate('/auth')}
              className='primaryButton'
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Get Started Free
            </button>
            {/* <button className='secondaryButton'>
              See Demo
            </button> */}
          </div>
        </div>
        
        <div className='heroImage'>
          <div className='mockupContainer'>
            <div className='laptop'>
              <div className='screen'>
                <div className='chartHeader'>
                  <div>
                    <button className='tabButton activeTab'>Equity</button>
                    <button className='tabButton'>Game</button>
                  </div>
                  <div className='' style={{fontSize: '0.875rem', color: '#64748b'}}>9K</div>
                </div>
                
                <div className='chartContainer'>
                  <div className='chartLine'></div>
                  <div className='' style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '20px',
                    right: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#94a3b8'
                  }}>
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>
                
                <div className='tradesSection'>
                  <h3 className='sectionTitle'>Trades</h3>
                  <div className='tradeRow'>
                    <div className='tradeInfo'>
                      <div className='tradeIcon'>Bu</div>
                      <span style={{fontSize: '0.875rem', color: '#64748b'}}>Apr Bu</span>
                    </div>
                    <div className='tradeStats'>
                      <span className='positiveValue'>+0.8</span>
                      <span className='neutralValue'>8.18</span>
                      <span className='neutralValue'>36.48</span>
                    </div>
                  </div>
                  <div className='tradeRow'>
                    <div className='tradeInfo'>
                      <div className='tradeIcon'>Rb</div>
                      <span style={{fontSize: '0.875rem', color: '#64748b'}}>Apr Rb</span>
                    </div>
                    <div className='tradeStats'>
                      <span className='positiveValue'>+6.98</span>
                      <span className='neutralValue'>85.28</span>
                      <span className='neutralValue'>7ph</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='laptopBase'></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='features'>
        <div className='featuresContainer'>
          <h2 className='featuresTitle'>Why Use Our Journal</h2>
          
          <div className='featuresGrid'>
            <div className='featureCard'>
              <div className='featureIcon'>
                <BarChart3 size={28} color="#3b82f6" />
              </div>
              <h3 className='featureTitle'>Log Every Trade with Precision</h3>
              <p className='featureDescription'>
                Log every trade with precision
              </p>
            </div>
            
            <div className='featureCard'>
              <div className='featureIcon'>
                <TrendingUp size={28} color="#3b82f6" />
              </div>
              <h3 className='featureTitle'>Analyze Your Performance</h3>
              <p className='featureDescription'>
                Analyze your performance
              </p>
            </div>
            
            <div className='featureCard'>
              <div className='featureIcon'>
                <Target size={28} color="#3b82f6" />
              </div>
              <h3 className='featureTitle'>Master Strategy</h3>
              <p className='featureDescription'>
                Master your strategy
              </p>
            </div>
          </div>
          
          {/* Testimonial */}
          {/* <div className='testimonial'>
            <div className='testimonialAvatar'>
              <User size={28} color="white" />
            </div>
            <p className='testimonialText'>
              "This journal has been a game-changer for my trading. It's streamlined my process and improved my results."
            </p>
          </div> */}
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className='cta'>
        <h2 className='ctaTitle'>Start Journaling Today</h2>
        <button
         className='ctaButton'
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Get Started Free
        </button>
      </section> */}
    </div>
  );
}

export default LandingPage;