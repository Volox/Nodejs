(function() {
  var KernelArguments, VoloCL;

  VoloCL = (function() {

    function VoloCL(kernelSrc) {
      this.cl = window.WebCL;
      this.platform = null;
      this.device = null;
      this.ctx = null;
      this.kernelSrc = null;
      this.program = null;
      this.kernel = null;
      this.localWS = null;
      this.globalWS = null;
      this.init(kernelSrc);
    }

    VoloCL.prototype.init = function(kernelSrc) {
      this.initCL(kernelSrc);
    };

    VoloCL.prototype.initCL = function(kernelSrc) {
      if (!window.WebCL) {
        alert("WebCL not supported");
      } else {

      }
      this.platform = this.getPlatforms()[0];
      this.device = this.getDevices(this.platform)[0];
      this.ctx = this.cl.createContextFromType([this.cl.CL_CONTEXT_PLATFORM, this.platform], this.cl.CL_DEVICE_TYPE_DEFAULT);
      this.loadKernel(kernelSrc);
    };

    VoloCL.prototype.getPlatforms = function() {
      return this.cl.getPlatformIDs();
    };

    VoloCL.prototype.getDevices = function(platform) {
      if (platform == null) platform = this.getPlatforms()[0];
      return platform.getDeviceIDs(this.cl.CL_DEVICE_TYPE_DEFAULT);
    };

    VoloCL.prototype.getKernel = function(val) {
      var ajaxResult, kernelSource;
      if (val) {
        ajaxResult = $.ajax(val, {
          async: false
        });
        kernelSource = ajaxResult.responseText;
      }
      return kernelSource;
    };

    VoloCL.prototype.loadKernel = function(url) {
      var log;
      try {
        this.kernelSrc = this.getKernel(url);
        this.program = this.ctx.createProgramWithSource(this.kernelSrc);
        try {
          this.program.buildProgram([this.device], "");
        } catch (error) {
          log = this.program.getProgramBuildInfo(this.device, this.cl.CL_PROGRAM_BUILD_LOG);
          console.log('Kernel NOT loaded');
          console.log(log);
          throw error;
        }
      } catch (error) {
        console.error(error);
      }
    };

    VoloCL.prototype.runKernel = function(name, size, kernelArgs) {
      var argument, cmdQueue, index, input, kernel, output, _i, _j, _len, _len2, _len3, _ref, _ref2, _ref3;
      kernel = this.program.createKernel(name);
      _ref = kernelArgs.arguments;
      for (index = 0, _len = _ref.length; index < _len; index++) {
        name = _ref[index];
        argument = kernelArgs.argumentsMap[name];
        kernel.setKernelArg(index, argument.buffer, argument.type);
      }
      cmdQueue = this.ctx.createCommandQueue(this.device, 0);
      _ref2 = kernelArgs.inputs;
      for (_i = 0, _len2 = _ref2.length; _i < _len2; _i++) {
        name = _ref2[_i];
        input = kernelArgs.argumentsMap[name];
        cmdQueue.enqueueWriteBuffer(input.buffer, false, 0, input.size, input.value, []);
      }
      this.setLocalWS([16, 4]);
      this.setGlobalWS([Math.ceil(size[0] / this.localWS[0]) * this.localWS[0], Math.ceil(size[1] / this.localWS[1]) * this.localWS[1]]);
      cmdQueue.enqueueNDRangeKernel(kernel, this.globalWS.length, [], this.globalWS, this.localWS, []);
      _ref3 = kernelArgs.outputs;
      for (_j = 0, _len3 = _ref3.length; _j < _len3; _j++) {
        name = _ref3[_j];
        output = kernelArgs.argumentsMap[name];
        cmdQueue.enqueueReadBuffer(output.buffer, false, 0, output.size, output.value, []);
      }
      cmdQueue.finish();
      cmdQueue.releaseCLResources();
    };

    VoloCL.prototype.setLocalWS = function(value) {
      this.localWS = value;
    };

    VoloCL.prototype.setGlobalWS = function(value) {
      this.globalWS = value;
    };

    VoloCL.prototype.createKernelArgs = function() {
      return new KernelArguments(this);
    };

    return VoloCL;

  })();

  KernelArguments = (function() {

    function KernelArguments(VoloCL) {
      this.cl = VoloCL.cl;
      this.ctx = VoloCL.ctx;
      this.arguments = [];
      this.inputs = [];
      this.outputs = [];
      this.argumentsMap = {};
      return;
    }

    KernelArguments.prototype.addInput = function(name, variable) {
      var buffer, size, value, varObj, _ref, _ref2, _ref3;
      value = variable;
      if (variable != null ? (_ref = variable.data) != null ? (_ref2 = _ref.data) != null ? _ref2.length : void 0 : void 0 : void 0) {
        value = variable.data.data;
      } else if (variable != null ? (_ref3 = variable.data) != null ? _ref3.length : void 0 : void 0) {
        value = variable.data;
      }
      size = value.length * value.BYTES_PER_ELEMENT;
      buffer = this.ctx.createBuffer(this.cl.CL_MEM_READ_ONLY, size);
      varObj = {
        name: name,
        size: size,
        value: value,
        buffer: buffer
      };
      this.arguments.push(name);
      this.inputs.push(name);
      this.argumentsMap[name] = varObj;
    };

    KernelArguments.prototype.addOutput = function(name, variable) {
      var buffer, size, value, varObj, _ref, _ref2, _ref3;
      value = variable;
      if (variable != null ? (_ref = variable.data) != null ? (_ref2 = _ref.data) != null ? _ref2.length : void 0 : void 0 : void 0) {
        value = variable.data.data;
      } else if (variable != null ? (_ref3 = variable.data) != null ? _ref3.length : void 0 : void 0) {
        value = variable.data;
      }
      size = value.length * value.BYTES_PER_ELEMENT;
      buffer = this.ctx.createBuffer(this.cl.CL_MEM_WRITE_ONLY, size);
      varObj = {
        name: name,
        size: size,
        value: value,
        buffer: buffer
      };
      this.outputs.push(name);
      this.arguments.push(name);
      this.argumentsMap[name] = varObj;
    };

    KernelArguments.prototype.addArgument = function(name, variable, type) {
      var varObj;
      if (type == null) type = "UINT";
      varObj = {
        buffer: variable,
        name: name,
        type: this.cl.types[type],
        value: variable
      };
      this.arguments.push(name);
      this.argumentsMap[name] = varObj;
    };

    return KernelArguments;

  })();

  window.KernelArguments = KernelArguments;

  window.VoloCL = VoloCL;

}).call(this);
