import React from 'react';

interface LandingPageProps {
  onLaunchApp: () => void; // Function to call when "Launch App" is clicked
}

// Helper function to get the base URL and build icon paths consistently 
const getIconPath = (fileName: string): string => {
  const basePath = import.meta.env.BASE_URL || '/';
  return `${basePath}assets/om-icons/${fileName}`;
};


const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  
  const handleButtonClick = () => {
    onLaunchApp(); // Call without logging
  };
  
  return (
    <div className="font-inter">
      {/* Navbar Section - Use button onClick instead of href */}
      <header className="absolute left-0 top-0 z-50 w-full">
        <div className="container mx-auto">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4">
              <a href="#" onClick={(e) => e.preventDefault()} className="block w-full py-5">
                <img src={"./assets/logo.png"} alt="Data Lineage" className="h-12" />
              </a>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              <div>
                {/* Navigation removed */}
              </div>
              <div className="hidden justify-end pr-16 sm:flex lg:pr-0">
                {/* Restore Original Button with type="button" */}
                <button 
                  type="button" // Add type="button"
                  onClick={handleButtonClick}
                  className="rounded-md bg-primary px-7 py-3 text-base font-medium text-white hover:bg-blue-dark"
                >
                  Launch App
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Use button onClick */}
      <div className="relative bg-white pb-[110px] pt-[120px] lg:pt-[150px]">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-5/12">
              <div className="hero-content">
                <h1 className="mb-5 text-4xl font-bold leading-tight text-dark sm:text-[42px] lg:text-[40px] xl:text-5xl">
                  Visualize Your<br />
                  Data Lineage<br />
                  With Ease
                </h1>
                <p className="mb-8 max-w-[480px] text-base text-body-color">
                  Understand data relationships, track data flow, and ensure compliance with our 
                  powerful data lineage visualization tool. Get insights into your data's journey 
                  from source to destination.
                </p>
                <ul className="flex flex-wrap items-center">
                  <li>
                    <button 
                      type="button" // Add type="button"
                      onClick={handleButtonClick}
                      className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-center text-base font-medium text-white hover:bg-blue-dark lg:px-7"
                    >
                      Get Started
                    </button>
                  </li>
                  <li>
                    {/* Keep Learn More as anchor link if needed */}
                    <a href="#features" className="inline-flex items-center justify-center px-5 py-3 text-center text-base font-medium text-[#464646] hover:text-primary">
                      Learn More
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="hidden px-4 lg:block lg:w-1/12"></div>
            <div className="w-full px-4 lg:w-6/12">
              <div className="lg:ml-auto lg:text-right">
                <div className="relative z-10 inline-block pt-11 lg:pt-0">
                  {/* Temporarily use logo.png as placeholder until screen.png is added */}
                  <img src={"./assets/screen.png"} alt="Data Lineage Dashboard" className="max-w-full rounded-lg shadow-xl lg:ml-auto" />
                  <span className="absolute -bottom-8 -left-8 z-[-1]">
                    {/* SVG dots pattern */}
                    <svg width="93" height="93" viewBox="0 0 93 93" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="2.5" cy="2.5" r="2.5" fill="#3056D3"></circle><circle cx="2.5" cy="24.5" r="2.5" fill="#3056D3"></circle><circle cx="2.5" cy="46.5" r="2.5" fill="#3056D3"></circle><circle cx="2.5" cy="68.5" r="2.5" fill="#3056D3"></circle><circle cx="2.5" cy="90.5" r="2.5" fill="#3056D3"></circle><circle cx="24.5" cy="2.5" r="2.5" fill="#3056D3"></circle><circle cx="24.5" cy="24.5" r="2.5" fill="#3056D3"></circle><circle cx="24.5" cy="46.5" r="2.5" fill="#3056D3"></circle><circle cx="24.5" cy="68.5" r="2.5" fill="#3056D3"></circle><circle cx="24.5" cy="90.5" r="2.5" fill="#3056D3"></circle><circle cx="46.5" cy="2.5" r="2.5" fill="#3056D3"></circle><circle cx="46.5" cy="24.5" r="2.5" fill="#3056D3"></circle><circle cx="46.5" cy="46.5" r="2.5" fill="#3056D3"></circle><circle cx="46.5" cy="68.5" r="2.5" fill="#3056D3"></circle><circle cx="46.5" cy="90.5" r="2.5" fill="#3056D3"></circle><circle cx="68.5" cy="2.5" r="2.5" fill="#3056D3"></circle><circle cx="68.5" cy="24.5" r="2.5" fill="#3056D3"></circle><circle cx="68.5" cy="46.5" r="2.5" fill="#3056D3"></circle><circle cx="68.5" cy="68.5" r="2.5" fill="#3056D3"></circle><circle cx="68.5" cy="90.5" r="2.5" fill="#3056D3"></circle><circle cx="90.5" cy="2.5" r="2.5" fill="#3056D3"></circle><circle cx="90.5" cy="24.5" r="2.5" fill="#3056D3"></circle><circle cx="90.5" cy="46.5" r="2.5" fill="#3056D3"></circle><circle cx="90.5" cy="68.5" r="2.5" fill="#3056D3"></circle><circle cx="90.5" cy="90.5" r="2.5" fill="#3056D3"></circle></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Supported By Section */}
          <div className="clients pt-24">
            <h6 className="mb-6 text-center text-xs font-normal text-body-color">
              <span className="mr-3 inline-block h-px w-8 bg-body-color align-middle"></span>
              Supported Services
              <span className="ml-3 inline-block h-px w-8 bg-body-color align-middle"></span>
            </h6>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 xl:gap-x-10">
              {/* Service Icons using consistent base path */}
              <img src={getIconPath("service-icon-snowflakes.png")} alt="Snowflake" title="Snowflake" className="h-8 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-airflow.png")} alt="Airflow" title="Airflow" className="h-8 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-tableau.png")} alt="Tableau" title="Tableau" className="h-7 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-dbt.png")} alt="dbt" title="dbt" className="h-6 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-redshift.png")} alt="Redshift" title="Redshift" className="h-8 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-kafka.png")} alt="Kafka" title="Kafka" className="h-8 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-spark.png")} alt="Spark" title="Spark" className="h-8 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-fivetran.png")} alt="Fivetran" title="Fivetran" className="h-7 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-looker.png")} alt="Looker" title="Looker" className="h-7 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-power-bi.png")} alt="Power BI" title="Power BI" className="h-8 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-mongodb.png")} alt="MongoDB" title="MongoDB" className="h-8 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-databrick.png")} alt="Databricks" title="Databricks" className="h-7 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-presto.png")} alt="Presto" title="Presto" className="h-8 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-superset.png")} alt="Superset" title="Superset" className="h-8 w-auto opacity-60"/>
              <img src={getIconPath("service-icon-trino.png")} alt="Trino" title="Trino" className="h-7 w-auto opacity-60"/>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark mb-4">Key Features</h2>
          <p className="text-body-color max-w-2xl mx-auto">Discover what makes our data lineage visualization tool the perfect solution for your data governance needs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Cards - omitted for brevity */}
           <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></div>
            <h3 className="text-xl font-semibold mb-3">Interactive Visualization</h3>
            <p className="text-body-color">Explore your data lineage with an intuitive, interactive graph that allows you to trace data flows from source to destination.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>
            <h3 className="text-xl font-semibold mb-3">Data Governance</h3>
            <p className="text-body-color">Ensure compliance with data regulations by understanding where sensitive data resides and how it moves through your systems.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
            <h3 className="text-xl font-semibold mb-3">Impact Analysis</h3>
            <p className="text-body-color">Quickly assess the impact of changes to your data infrastructure and identify dependencies between data assets.</p>
          </div>
        </div>
      </div>

      {/* CTA Section - Use button onClick */}
      <div className="bg-primary py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Map Your Data Journey?</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">Start visualizing your data lineage today and gain valuable insights into your data's journey.</p>
          <button 
            type="button" // Add type="button"
            onClick={handleButtonClick}
            className="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-center text-base font-medium text-primary hover:bg-gray-100"
          >
            Launch Application
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="container mx-auto">
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <div className="flex items-center justify-center">
              <p className="text-body-color">© 2025 Data Lineage Visualizer. All rights reserved.</p>
              <a href="https://github.com/nick-young/data-lineage-ui" target="_blank" rel="noopener noreferrer" className="text-body-color hover:text-primary ml-4" title="GitHub Repository">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.034c-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.109-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.795 24 17.3 24 12c0-6.627-5.373-12-12-12z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 