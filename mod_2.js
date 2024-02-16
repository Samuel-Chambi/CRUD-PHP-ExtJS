Ext.onReady(function() {
    Ext.QuickTips.init();
    // Modelo de Venta
    Ext.define("venta", {
        extend: 'Ext.data.Model',
        fields: [
            { name: "ven_ide", type: "int" },
            { name: "ven_ser", type: "string", defaultValue: "" },
            { name: "ven_num", type: "string", defaultValue: "" },
            { name: "ven_cli", type: "string", defaultValue: "" },
            { name: "ven_mon", type: "float", defaultValue: 0.00 },
        ],
    });

    // Modelo de Venta_Detalle
    Ext.define("venta_det",{
        extend: 'Ext.data.Model',
        fields: [
            {name: "v_d_ide", type: "int"},
            {name: "ven_ide", type: "int"},
            {name: "v_d_pro", type: "string", defaultValue: ""},
            {name: "v_d_uni", type: "float"},
            {name: "v_d_can", type: "float"},
            {name: "v_d_tot", type: "float"},
            {name: "est_ado", type: "int", defaultValue: 1},
        ],
    }); 

    //Definimos el store para ventas
    var ventas_store = Ext.create("Ext.data.Store", {
        model: "venta",
        proxy: {
            type: "ajax",
            url: "venta_controller.php",
            method: 'GET',
            extraParams: {
                action: 'getVentas',
            },
            reader: {
                type: "json",
                rootProperty: "data",
            },
        },
        autoLoad: true,
    });

    var ventas_det_store = Ext.create("Ext.data.Store" , {
        model: "venta_det",
    });

    
    var ventaGrid = Ext.create('Ext.grid.Panel', {
        columns: [
            { text: 'ID', dataIndex: 'ven_ide', flex: 1 },
            { text: 'Serie', dataIndex: 'ven_ser', flex: 1 },
            { text: 'Número', dataIndex: 'ven_num', flex: 1 },
            { text: 'Cliente', dataIndex: 'ven_cli', flex: 1 },
            { text: 'Monto', dataIndex: 'ven_mon', flex: 1 }
        ],
        store: ventas_store,
        height: 200,
        width: 1000,
        title: 'Ventas',
        style: {
            margin: 'auto'
        },
        renderTo: Ext.getBody(),
        buttons: [{
            text: 'Nuevo',
            handler: function () {
                ventaForm.getForm().reset();
                ventaForm.show();
            }
        }, {
            text: 'Modificar',
            handler: function () {
                var venta = ventaGrid.getSelectionModel().getSelection()[0];
                if (venta) {
                    actForm.getForm().setValues({
                        ven_ide: venta.get('ven_ide'),
                        ven_ser: venta.get('ven_ser'),
                        ven_num: venta.get('ven_num'),
                        ven_cli: venta.get('ven_cli'),
                        ven_mon: venta.get('ven_mon')
                    });
            
                    // Obtener el ID de la venta
                    var ven_ide = venta.get('ven_ide');
                    Ext.Ajax.request({
                        url: 'venta_controller.php',
                        method: 'GET',
                        params: {
                            action: 'getDetalleVenta',
                            id: ven_ide
                        },
                        success: function(response) {
                            var data = Ext.decode(response.responseText);
                            if (data.length > 0) {
                                actForm.getForm().setValues({
                                    v_d_pro: data[0].v_d_pro,
                                    v_d_uni: data[0].v_d_uni,
                                    v_d_can: data[0].v_d_can
                                });
                            } else {
                                console.log('Error al obtener los detalles de la venta');
                            }
                        },
                        failure: function(response) {
                            console.log('Error en la solicitud al servidor');
                        }
                    });
                    actForm.show();
                } else {
                    // No se ha seleccionado ninguna venta en el grid de ventas
                    console.log('Por favor, selecciona una venta');
                }
            }
        }, {
            text: 'Eliminar',
            handler: function () {
                var venta = ventaGrid.getSelectionModel().getSelection()[0];
                if (venta) {
                    Ext.Ajax.request({
                      url: "venta_controller.php",
                      method: "POST",
                      params: {
                        action: "delete",
                        ven_ide: venta.get("ven_ide"),
                      },
                      success: function (response) {
                        var result = Ext.decode(response.responseText);
                        if (result.success) {
                          Ext.Msg.alert("Éxito", result.msg);
                        } else {
                          Ext.Msg.alert("Error", result.msg);
                        }
                      },
                      failure: function (response) {
                        Ext.Msg.alert("Error", "Error al eliminar la venta");
                      },
                    });
                  } else {
                    Ext.Msg.alert(
                      "Error",
                      "Por favor, selecciona una venta para eliminar."
                    );
                  }
            }
        }]
    });
    var ventaForm = Ext.create('Ext.form.Panel', {
        title: 'Registro de Venta',
        style: {
            margin: 'auto'
        },
        bodyPadding: 10,
        width: 1000,
        hidden: true,
        items: [{
            xtype: 'textfield',
            fieldLabel: 'Serie',
            name: 'ven_ser',
            allowBlank: false
        }, {
            xtype: 'textfield',
            fieldLabel: 'Número',
            name: 'ven_num',
            allowBlank: false
        }, {
            xtype: 'textfield',
            fieldLabel: 'Cliente',
            name: 'ven_cli',
            allowBlank: false
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Monto',
            name: 'ven_mon',
            allowBlank: false
        }, {
            xtype: 'textfield',
            fieldLabel: 'Producto',
            name: 'v_d_pro',
            allowBlank: false
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Precio Unitario',
            name: 'v_d_uni',
            allowBlank: false
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Cantidad',
            name: 'v_d_can',
            allowBlank: false
        }],
        buttons: [{
            text: 'Guardar',
            handler: function () {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    form.submit({
                        url: 'venta_controller.php', // URL para guardar la venta
                        params: {
                            action: 'new',
                        },
                        success: function (form, action) {
                            Ext.Msg.alert('Éxito', 'La venta ha sido registrada correctamente');
                            ventas_store.load();
                            ventaForm.hide();
                        },
                        failure: function (form, action) {
                            Ext.Msg.alert('Error', 'Ha ocurrido un error al registrar la venta');
                        }
                    });
                }
            }
            }, {
            text: 'Cancelar',
            handler: function () {
                this.up('form').getForm().reset();
                this.up('form').hide();
            }
        }],
        renderTo: Ext.getBody(),
    });
    var actForm = Ext.create('Ext.form.Panel', {
        title: 'Edicion de Venta',
        bodyPadding: 10,
        style: {
        margin: 'auto'
        },
        width: 1000,
        hidden: true,
        renderTo: Ext.getBody(),
        items: [{
            xtype: 'numberfield',
            fieldLabel: 'ID Venta',
            name: 'ven_ide',
            readOnly: true,
        },{
            xtype: 'textfield',
            fieldLabel: 'Serie',
            name: 'ven_ser',
            allowBlank: false
        }, {
            xtype: 'textfield',
            fieldLabel: 'Número',
            name: 'ven_num',
            allowBlank: false
        }, {
            xtype: 'textfield',
            fieldLabel: 'Cliente',
            name: 'ven_cli',
            allowBlank: false
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Monto',
            name: 'ven_mon',
            allowBlank: false
        }, {
            xtype: 'textfield',
            fieldLabel: 'Producto',
            name: 'v_d_pro',
            allowBlank: false
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Precio Unitario',
            name: 'v_d_uni',
            allowBlank: false
        }, {
            xtype: 'numberfield',
            fieldLabel: 'Cantidad',
            name: 'v_d_can',
            allowBlank: false
        }],
        buttons: [{
            text: 'Guardar',
            handler: function () {
                var form = this.up('form').getForm();
                if (form.isValid()) {
                    form.submit({
                        url: 'venta_controller.php', // URL para guardar la venta
                        params: {
                            action: 'edit',
                        },
                        success: function (form, action) {
                            Ext.Msg.alert('Éxito', 'La venta ha sido actualizada correctamente');
                            ventas_store.load();
                            actForm.hide();
                        },
                        failure: function (form, action) {
                            Ext.Msg.alert('Error', 'Ha ocurrido un error al actualizar la venta');
                        }
                    });
                }
            }
            }, 
            {
            text: 'Cancelar',
            handler: function () {
                this.up('form').getForm().reset();
                this.up('form').hide();
            }
        }]
    });
    var detalleGrid = Ext.create('Ext.grid.Panel', {
        store: ventas_det_store,
        columns: [
            { text: 'ID', dataIndex: 'v_d_ide', flex: 1 },
            { text: 'ID Venta', dataIndex: 'ven_ide', flex: 1 },
            { text: 'Producto', dataIndex: 'v_d_pro', flex: 1 },
            { text: 'Precio Unitario', dataIndex: 'v_d_uni', flex: 1 },
            { text: 'Cantidad', dataIndex: 'v_d_can', flex: 1 },
            { text: 'Total', dataIndex: 'v_d_tot', flex: 1 },
            { text: 'Estado', dataIndex: 'est_ado', flex: 1 }
        ],
        height: 200,
        width: 1000,
        title: 'Detalle de Venta',
        style: {
            margin: 'auto'
        },
        renderTo: Ext.getBody(),
        hidden: true,
        buttons:[
            {
                text: 'Ocultar',
                handler: function(){
                    detalleGrid.hide();
                },
            },
        ],
    });
    ventaGrid.on('select', function() {
        // Mostrar el grid de detalles al seleccionar un registro en el grid de ventas
        detalleGrid.show();
        // Cargar los detalles de la venta seleccionada en el grid de detalles
        var record = ventaGrid.getSelectionModel().getSelection()[0];
        var ven_ide = record.get('ven_ide');
        Ext.Ajax.request({
            url: 'venta_controller.php',
            method: 'GET',
            params: {
                action: 'getDetalleVenta',
                id: ven_ide,
            },
            success: function(response) {
                var data = Ext.decode(response.responseText);
                ventas_det_store.loadData(data);
            },
            failure: function(response) {
                Ext.Msg.alert('Error', 'Error al cargar los detalles de la venta');
            }
        });
    });
    
});