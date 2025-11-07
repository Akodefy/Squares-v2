import { Menu, X, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import newBadge from "@/assets/new-badge.gif";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { useState } from "react";
import { useTheme } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import CustomerProfileDropdown from "@/components/customer/CustomerProfileDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  console.log('Navbar: isAuthenticated:', isAuthenticated);
  console.log('Navbar: user:', user);

  // Property categories for dropdown
  const residentialProperties = [
    { label: "Flat / Apartment", value: "flat_apartment" },
    { label: "Residential House", value: "residential_house" },
    { label: "Villa", value: "villa" },
    { label: "Builder Floor Apartment", value: "builder_floor_apartment" },
    { label: "Residential Land / Plot", value: "residential_land_plot" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Studio Apartment", value: "studio_apartment" },
    { label: "PG (Paying Guest)", value: "pg" },
  ];

  const commercialProperties = [
    { label: "Commercial Office Space", value: "commercial_office_space" },
    { label: "Office in IT Park / SEZ", value: "office_in_it_park_sez" },
    { label: "Commercial Shop", value: "commercial_shop" },
    { label: "Commercial Showroom", value: "commercial_showroom" },
    { label: "Commercial Land", value: "commercial_land" },
    { label: "Warehouse / Godown", value: "warehouse_godown" },
    { label: "Industrial Land", value: "industrial_land" },
    { label: "Industrial Building", value: "industrial_building" },
    { label: "Industrial Shed", value: "industrial_shed" },
  ];

  const agriculturalProperties = [
    { label: "Agricultural Land", value: "agricultural_land" },
    { label: "Farm House", value: "farm_house" },
  ];

  const handlePropertyTypeClick = (listingType: string, propertyType?: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('listingType', listingType);
    if (propertyType) {
      searchParams.set('propertyType', propertyType);
    }
    navigate(`/customer/search?${searchParams.toString()}`);
  };

  return (
    <>
      {/* Logo - Responsive positioning */}
      <Link 
        to="/" 
        className="fixed -top-5 -left-6 xs:top-0 xs:left-4 sm:left-6 md:-top-8 md:left-8 z-[60] transition-transform hover:scale-105 duration-300"
      >
        <img
          src={theme === "dark" ? logoDark : logoLight}
          alt="BuildHomeMart"
          className="w-[160px] h-[80px] xs:w-[180px] xs:h-[85px] sm:w-[200px] sm:h-[90px] md:w-[220px] md:h-[100px] object-contain"
        />
      </Link>
      
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex h-14 xs:h-16 items-center justify-between">
            {/* Desktop Navigation */}
            <div className="flex items-center gap-4 md:gap-8 flex-1">
              <div className="hidden md:flex items-center gap-4 lg:gap-6 ml-[180px] lg:ml-[220px]">
                {/* Buy Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1 outline-none">
                    Buy <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => handlePropertyTypeClick('sale')}>
                      All Properties for Sale
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Residential</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-56">
                        {residentialProperties.map((prop) => (
                          <DropdownMenuItem 
                            key={prop.value}
                            onClick={() => handlePropertyTypeClick('sale', prop.value)}
                          >
                            {prop.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Agricultural</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-56">
                        {agriculturalProperties.map((prop) => (
                          <DropdownMenuItem 
                            key={prop.value}
                            onClick={() => handlePropertyTypeClick('sale', prop.value)}
                          >
                            {prop.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Rent Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1 outline-none">
                    Rent <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => handlePropertyTypeClick('rent')}>
                      All Properties for Rent
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Residential</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-56">
                        {residentialProperties.map((prop) => (
                          <DropdownMenuItem 
                            key={prop.value}
                            onClick={() => handlePropertyTypeClick('rent', prop.value)}
                          >
                            {prop.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sell Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1 outline-none">
                    Sell <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/vendor/login')}>
                      Post Property for Free
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/contact?service=valuation')}>
                      Property Valuation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/vendor/properties')}>
                      My Listed Properties
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Commercial Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1 outline-none">
                    Commercial <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem onClick={() => handlePropertyTypeClick('sale', 'all_commercial')}>
                      Buy Commercial Property
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePropertyTypeClick('rent', 'all_commercial')}>
                      Rent Commercial Property
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Commercial Types</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="w-56">
                        {commercialProperties.map((prop) => (
                          <DropdownMenuItem 
                            key={prop.value}
                            onClick={() => handlePropertyTypeClick('sale', prop.value)}
                          >
                            {prop.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link
                  to="/contact"
                  className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
                >
                  Support
                </Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mr-2 xs:mr-0">
              <Link to="/vendor/login" className="hidden md:block">
                <Button
                  variant="ghost"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4"
                >
                  Post Property
                </Button>
              </Link>
              
              {isAuthenticated ? (
                <CustomerProfileDropdown />
              ) : (
                <Link to="/login" className="hidden xs:block">
                  <Button variant="ghost" className="hover:bg-accent/10 text-xs sm:text-sm px-2 sm:px-4">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline ml-2">Login / Register</span>
                    <span className="sm:hidden ml-1">Login</span>
                  </Button>
                </Link>
              )}
              
              <div className="hidden xs:block">
                <ThemeToggle />
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </div>

        {/* Mobile Menu - Responsive */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
              {/* Buy Section */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Buy</p>
                <button
                  onClick={() => {
                    handlePropertyTypeClick('sale');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  All Properties for Sale
                </button>
                <button
                  onClick={() => {
                    handlePropertyTypeClick('sale', 'flat_apartment');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 pl-4 text-sm hover:text-primary transition-colors"
                >
                  Residential Properties
                </button>
              </div>

              {/* Rent Section */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Rent</p>
                <button
                  onClick={() => {
                    handlePropertyTypeClick('rent');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  All Properties for Rent
                </button>
                <button
                  onClick={() => {
                    handlePropertyTypeClick('rent', 'flat_apartment');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 pl-4 text-sm hover:text-primary transition-colors"
                >
                  Residential Properties
                </button>
              </div>

              {/* Sell Section */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Sell</p>
                <Link
                  to="/vendor/login"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Post Property for Free
                </Link>
              </div>

              {/* Commercial Section */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Commercial</p>
                <button
                  onClick={() => {
                    handlePropertyTypeClick('sale', 'all_commercial');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Buy Commercial
                </button>
                <button
                  onClick={() => {
                    handlePropertyTypeClick('rent', 'all_commercial');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  Rent Commercial
                </button>
              </div>

              <Link
                to="/contact"
                className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>

              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="block xs:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-center hover:bg-accent/10">
                    <User className="h-5 w-5 mr-2" />
                    Login / Register
                  </Button>
                </Link>
              )}
              <div className="xs:hidden pt-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Navbar;