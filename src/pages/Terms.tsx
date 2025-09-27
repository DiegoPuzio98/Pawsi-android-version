import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Términos y Condiciones - Pawsi</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="mb-4">
              Pawsi cuenta con un sistema interno de mensajería anónimo para garantizar la seguridad del usuario. 
              Las opciones de compartir números de teléfono, direcciones exactas y fotografías son opcionales, 
              y al proporcionarlas, el usuario consiente que dicha información personal sea pública.
            </p>
            <p className="mb-4">
              Al usar esta plataforma, aceptas que toda la información proporcionada voluntariamente 
              (incluyendo contactos, ubicaciones y fotos) será visible públicamente para otros usuarios.
            </p>
            <p className="mb-4">
              Para mayor seguridad, recomendamos usar el sistema de mensajería interno de Pawsi 
              antes de compartir información personal directa.
            </p>
            <h3 className="text-lg font-semibold mb-2">Comunicación y Mensajería</h3>
            <p className="mb-4">
              Los usuarios pueden comunicarse entre sí a través del sistema de mensajería interno de la plataforma. 
              Toda comunicación debe ser respetuosa y relacionada con los animales publicados.
            </p>
            <p className="mb-4 text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <strong>Importante:</strong> Los mensajes y conversaciones reportadas por usuarios pueden ser revisados por nuestro equipo de moderación 
              con fines de seguridad, protección de usuarios y cumplimiento de estos términos de uso. Al usar nuestro sistema de mensajería, 
              aceptas que tus comunicaciones pueden ser supervisadas cuando sean objeto de reportes por comportamiento inapropiado.
            </p>
            
            <h3 className="text-lg font-bold mb-2">Sistema de Moderación y Seguridad</h3>
            <p className="mb-4">
              Los chats y publicaciones reportados pueden ser revisados por el sistema de moderación de Pawsi, 
              únicamente con fines de seguridad y cumplimiento de las normas comunitarias. Los usuarios serán 
              notificados si su contenido es eliminado; la repetición de infracciones puede derivar en la 
              suspensión o eliminación de la cuenta.
            </p>
            <p className="mb-4">
              Nos reservamos el derecho de eliminar contenido que consideremos inapropiado, ofensivo o que 
              viole nuestras normas comunitarias. Esto incluye, pero no se limita a: spam, contenido falso, 
              maltrato animal, ventas comerciales no autorizadas o exposición indebida de datos personales.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}