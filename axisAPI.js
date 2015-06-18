var axisAPI = {
    version: '0.2.0',
    extendLayout: function(layout,self) {

        // Get the number of dimensions
        var dim_count = layout.qHyperCube.qDimensionInfo.length;

        // Iterate over the qMatrix
        layout.qHyperCube.qDataPages[0].qMatrix.forEach(function(d) {

            // Add a dimension accessor function on each row
            d.dim = function(i) {
                return d[i-1];
            };

            // Add a measure accessor function on each row
            d.measure = function(i) {
                return d[i+dim_count-1];
            };
        });
    },
    extensions: {
        makeLayoutSelectable: function(layout,ext) {

            // Get the number of dimensions
            var dim_count = layout.qHyperCube.qDimensionInfo.length;

            // Iterate over the qMatrix
            layout.qHyperCube.qDataPages[0].qMatrix.forEach(function(d) {
                // Add a selection function on each dimension value ** EXTENSIONS ONLY **
                for (var i = 0; i<dim_count; i++) {
                    d[i].qExt = ext;
                    d[i].qIndex = i;
                    d[i].qSelect = function() {
                        this.qExt.backendApi.selectValues(this.qIndex,[this.qElemNumber],true);
                    };
                }
            });
        }
    },
	object: function() {
		var app,
			prop,
            paintFunc,
            createFunc,
            repaint,
            repaintFunc,
        	sock,
        	layout,
        	qId,
        	_this = this;

        function object() {
        }

        object.on = function(t,_) {
            if(t==='create') {
                createFunc = _;
            }
            else if(t==='paint') {
                paintFunc = _;
            }
            else if(t==='repaint') {
                repaintFunc = _;
            }
            return object;
        };

        object.app = function(_) {
            if (!arguments.length)
                return app;
            app = _;
            return object;
        };

        object.prop = function(_) {
            if (!arguments.length)
                return prop;
            prop = _;
            return object;
        };

        object.paint = function() {
            paintFunc(object);
            return object;
        };

        object.repaint = function(_) {
            repaintFunc(object);
            return object;
        };

        object.sock = function() {
        	return sock;
        };

        object.qId = function() {
    		return qId;
        };

        object.layout = function(_) {
        	if(!arguments.length)
        		return layout;
        	layout = _;
        	return object;
        };

        object.create = function() {
        	app.createSessionObject(prop).then(function(reply) {
        		sock = reply;
        		sock.getLayout().then(function(reply) {
        			qId = reply.qInfo.qId;
        			layout = reply;
                    createFunc(object);
        		});

        	});
        	return object;
        };

        object.destroy = function() {
        	app.destroySessionObject(qId);
        };

        object.update = function() {
        	sock.getLayout().then(function(reply) {
        		layout = reply;
                if(repaint === undefined) {
                    object.paint();
                }
                else {
                    object.repaint();
                }
        	});
        };
        return object;
	}
};
