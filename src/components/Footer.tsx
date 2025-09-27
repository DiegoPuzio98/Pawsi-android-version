const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border py-4 px-4 text-center">
      <div className="text-sm text-muted-foreground">
        Pawsi · Aplicación desarrollada por Hugo Diego Puzio · © 2025 · Licencia Apache 2.0 · {" "}
        <a 
          href="https://www.apache.org/licenses/LICENSE-2.0" 
          target="_blank" 
          rel="noopener"
          className="text-primary hover:underline"
        >
          Ver licencia
        </a>
      </div>
    </footer>
  );
};

export default Footer;