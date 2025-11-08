import { Link } from "react-router-dom";

const SubAdminFooter = () => {
  return (
    <footer className="border-t bg-card py-4 px-6 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BuildHomeMart. All rights reserved.
        </div>
        <div className="flex gap-4 text-sm">
          <Link 
            to="/subadmin/policy-editor/privacy-policy" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/subadmin/policy-editor/refund-policy" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default SubAdminFooter;
