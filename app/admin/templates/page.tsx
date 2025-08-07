function TemplatesPage() {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<any>(null)
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* All content, dialogs, and tables go here, as in the previous code, properly nested */}
      </div>
    </AdminLayout>
  )
}
