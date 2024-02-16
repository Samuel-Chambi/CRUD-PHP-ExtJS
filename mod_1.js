Ext.onReady(function () {
  Ext.QuickTips.init();
  // Define el modelo para los trabajadores
  Ext.define("Worker", {
    extend: "Ext.data.Model",
    fields: [
      { name: "tra_ide", type: "int" },
      { name: "tra_cod", type: "int", defaultValue: 0 },
      { name: "tra_nom", type: "string", defaultValue: "" },
      { name: "tra_pat", type: "string", defaultValue: "" },
      { name: "tra_mat", type: "string", defaultValue: "" },
      { name: "est_ado", type: "int", defaultValue: 1 },
    ],
  });

  // Define el store para los trabajadores
  var workerStore = Ext.create("Ext.data.Store", {
    model: "Worker",
    proxy: {
      type: "ajax",
      url: "worker_controller.php", // Ruta al backend PHP que maneja las solicitudes
      reader: {
        type: "json",
        rootProperty: "data",
      },
    },
    autoLoad: true,
  });

  // Define el grid para mostrar los trabajadores
  var workerGrid = Ext.create("Ext.grid.Panel", {
    title: "Trabajadores",
    style: {
      margin: 'auto'
    },
    store: workerStore,
    columns: [
      { text: "ID", dataIndex: "tra_ide", flex: 1 },
      { text: "Código", dataIndex: "tra_cod", flex: 1 },
      { text: "Nombre", dataIndex: "tra_nom", flex: 1 },
      { text: "Apellido Paterno", dataIndex: "tra_pat", flex: 1 },
      { text: "Apellido Materno", dataIndex: "tra_mat", flex: 1 },
      { text: "Estado", dataIndex: "est_ado", flex: 1 },
    ],
    height: 300,
    width: 1000,
    renderTo: Ext.getBody(),
    buttons:[{
        // xtype: "button",
        text: "Nuevo",
        handler: function () {
          newForm.getForm().reset(); // Limpiar el formulario
          newForm.show(); // Mostrar el formulario
        },
      },
      {
        // xtype: "button",
        text: "Modificar",
        handler: function () {
          var selectedWorker = workerGrid.getSelectionModel().getSelection()[0];
          if (selectedWorker) {
            modForm.getForm().loadRecord(selectedWorker); // Cargar datos en el formulario
            modForm.show(); // Mostrar el formulario
          } else {
            Ext.Msg.alert(
              "Error",
              "Por favor, selecciona un trabajador para modificar."
            );
          }
        },
      },
      {
        // xtype: "button",
        text: "Eliminar",
        handler: function () {
          var selectedWorker = workerGrid.getSelectionModel().getSelection()[0];
          if (selectedWorker) {
            Ext.Ajax.request({
              url: "worker_controller.php",
              method: "POST",
              params: {
                action: "delete",
                tra_ide: selectedWorker.get("tra_ide"),
              },
              success: function (response) {
                var result = Ext.decode(response.responseText);
                if (result.success) {
                  Ext.Msg.alert("Éxito", result.msg);
                  workerStore.load();
                } else {
                  Ext.Msg.alert("Error", result.msg);
                }
              },
              failure: function (response) {
                Ext.Msg.alert("Error", "Error al eliminar el trabajador");
              },
            });
          } else {
            Ext.Msg.alert(
              "Error",
              "Por favor, selecciona un trabajador para eliminar."
            );
          }
        },
      },

    ],
  });

  // Define el formulario para insertar
  var newForm = Ext.create("Ext.form.Panel", {
    title: 'Nuevo trabajador',
    style: {
      margin: 'auto'
    },
    bodyPadding: 10,
    defaultType: "textfield",
    items: [
      // { fieldLabel: 'ID', name: 'tra_ide', readOnly: true },
      { fieldLabel: "Código", name: "tra_cod" },
      { fieldLabel: "Nombre", name: "tra_nom" },
      { fieldLabel: "Apellido Paterno", name: "tra_pat" },
      { fieldLabel: "Apellido Materno", name: "tra_mat" },
    ],
    buttons: [
      {
        text: "Guardar",
        handler: function () {
          var form = this.up("form").getForm();
          if (form.isValid()) {
            form.submit({
              url: "worker_controller.php",
              params: {
                action: "new",
              },
              success: function (form, action) {
                Ext.Msg.alert("Éxito", action.result.msg);
                workerStore.load();
                newForm.hide();
              },
              failure: function (form, action) {
                Ext.Msg.alert("Error", action.result.msg);
              },
            });
          }
        },
      },
      {
        text: "Cancelar",
        handler: function () {
          newForm.getForm().reset();
          newForm.hide();
        },
      },
    ],
    height: 200,
    width: 1000,
    renderTo: Ext.getBody(),
    hidden: true,
  });

  var modForm = Ext.create("Ext.form.Panel", {
    title: 'Editar trabajador',
    bodyPadding: 10,
    style: {
      margin: 'auto'
    },
    defaultType: "textfield",
    items: [
      { fieldLabel: "ID", name: "tra_ide", readOnly: true },
      { fieldLabel: "Código", name: "tra_cod" },
      { fieldLabel: "Nombre", name: "tra_nom" },
      { fieldLabel: "Apellido Paterno", name: "tra_pat" },
      { fieldLabel: "Apellido Materno", name: "tra_mat" },
    ],
    buttons: [
      {
        text: "Guardar",
        handler: function () {
          var form = this.up("form").getForm();
          if (form.isValid()) {
            form.submit({
              url: "worker_controller.php",
              params: {
                action: "edit",
              },
              success: function (form, action) {
                Ext.Msg.alert("Éxito", action.result.msg);
                workerStore.load();
                modForm.hide();
              },
              failure: function (form, action) {
                Ext.Msg.alert("Error", action.result.msg);
              },
            });
          }
        },
      },
      {
        text: "Cancelar",
        handler: function () {
          modForm.getForm().reset();
          modForm.hide();
        },
      },
    ],
    height: 200,
    width: 1000,
    renderTo: Ext.getBody(),
    hidden: true,
  });
});
