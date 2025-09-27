import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, CheckCircle } from "lucide-react";

interface Report {
  id: string;
  post_type: string;
  post_id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  reporter_user_id?: string;
  content?: any;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewContentOpen, setViewContentOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is admin
  const isAdmin = user?.email === 'ecomervix@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin, status]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reports', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`
        }
      });

      if (error) throw error;

      setReports(data.reports || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (report: Report) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar este contenido?\n\nTipo: ${report.post_type}\nID: ${report.post_id}\nRazón: ${report.reason}`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-content', {
        body: {
          content_type: report.post_type,
          content_id: report.post_id,
          report_id: report.id,
          admin_id: user?.id
        },
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`
        }
      });

      if (error) throw error;

      toast({
        title: "Contenido eliminado",
        description: "El contenido ha sido eliminado y el usuario ha sido notificado"
      });

      fetchReports(); // Refresh the list
      setViewContentOpen(false);
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contenido",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const markAsReviewed = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('post_reports')
        .update({ 
          status: 'reviewed',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id 
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Reporte marcado como revisado",
        description: "El reporte ha sido marcado como revisado"
      });

      fetchReports();
    } catch (error: any) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el reporte",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      case 'reviewed':
        return <Badge variant="outline">Revisado</Badge>;
      case 'resolved':
        return <Badge variant="default">Resuelto</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      'spam': 'Spam o contenido repetitivo',
      'inappropriate': 'Contenido inapropiado',
      'fake': 'Información falsa',
      'animal_abuse': 'Posible maltrato animal',
      'commercial': 'Venta comercial no permitida',
      'offensive': 'Contenido ofensivo',
      'personal_data': 'Exposición de datos personales',
      'other': 'Otro motivo'
    };
    return reasons[reason] || reason;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No tienes permisos para acceder a esta página.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="reviewed">Revisados</SelectItem>
              <SelectItem value="resolved">Resueltos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">Cargando reportes...</div>
        ) : (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    No hay reportes {status === 'pending' ? 'pendientes' : status === 'reviewed' ? 'revisados' : 'resueltos'}.
                  </p>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Reporte {report.id.slice(0, 8)}...
                      </CardTitle>
                      {getStatusBadge(report.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Tipo:</strong> {report.post_type}
                        </div>
                        <div>
                          <strong>ID del contenido:</strong> {report.post_id}
                        </div>
                        <div>
                          <strong>Razón:</strong> {getReasonLabel(report.reason)}
                        </div>
                        <div>
                          <strong>Fecha:</strong> {new Date(report.created_at).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                      
                      {report.description && (
                        <div>
                          <strong>Descripción:</strong>
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setViewContentOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver contenido
                        </Button>
                        
                        {report.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsReviewed(report.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como revisado
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Content View Dialog */}
        <Dialog open={viewContentOpen} onOpenChange={setViewContentOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Ver contenido reportado
              </DialogTitle>
            </DialogHeader>
            
            {selectedReport && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Información del reporte</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>ID:</strong> {selectedReport.id}</p>
                    <p><strong>Tipo:</strong> {selectedReport.post_type}</p>
                    <p><strong>Razón:</strong> {getReasonLabel(selectedReport.reason)}</p>
                    {selectedReport.description && (
                      <p><strong>Descripción:</strong> {selectedReport.description}</p>
                    )}
                  </div>
                </div>

                {selectedReport.content ? (
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Contenido</h3>
                    <div className="space-y-2">
                      <p><strong>Título:</strong> {selectedReport.content.title || 'Sin título'}</p>
                      {selectedReport.content.description && (
                        <div>
                          <strong>Descripción:</strong>
                          <p className="text-sm mt-1">{selectedReport.content.description}</p>
                        </div>
                      )}
                      <p><strong>Estado:</strong> {selectedReport.content.status}</p>
                      <p><strong>Usuario ID:</strong> {selectedReport.content.user_id || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-muted-foreground">
                      El contenido no pudo ser cargado (posiblemente ya fue eliminado).
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteContent(selectedReport)}
                    disabled={isDeleting || !selectedReport.content}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Eliminando...' : 'Eliminar contenido'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setViewContentOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}