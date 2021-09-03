$(document).ready(function () {
    var logConfig = {};
    var navListItems = $('div.setup-panel div a'),
            allWells = $('.setup-content'),
            allNextBtn = $('.nextBtn'),
            allPrevBtn = $('.prevBtn');

    allWells.hide();

    navListItems.click(function (e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
                $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('btn-primary').addClass('btn-default');
            $item.addClass('btn-primary');
            allWells.hide();
            $target.show();
            $target.find('input:eq(0)').focus();
        }
    });
    
    //Logic for show/hide map types based on mobile or web option
    
    $("input[type='checkbox'],input[type='radio']").change(function(){
        if(this.name == "platform" && this.value != "web"){
            $("#maps").addClass("hide");
            disableMapTypes();
        }
        if($("#radios-1")[0].checked && this.checked && this.value == "map")
            $("#maps").removeClass("hide");
        if($("#radios-1")[0].checked && !this.checked && this.value == "map")
            disableMapTypes();
        if(this.name == "platform" && this.value == "web")
        {
            if($("#radios-1")[0].checked && this.checked){
                $("#maps").removeClass("hide");
            }else{
                $("#maps").addClass("hide");
                disableMapTypes();
            }
        }
        /*if($("#radios-2")[0].checked && this.checked){
			//console.log('mobi')
			$("#checkboxes-3-3").prop("checked","");
			$("#checkboxes-3-3").prop("disabled","disabled");    
			$("#checkboxes-2-2").prop("checked","");
			$("#checkboxes-2-2").prop("disabled","disabled"); 
            $("#checkboxes-2-4").prop("checked","");
            $("#checkboxes-2-4").prop("disabled","disabled"); 
		}
		if($("#radios-1")[0].checked && this.checked){
			//console.log('mobi')
			$("#checkboxes-3-3").prop("checked","checked");
			$("#checkboxes-3-3").removeAttr("disabled");  
			$("#checkboxes-2-2").prop("checked","checked");
			$("#checkboxes-2-2").removeAttr("disabled");
            //$("#checkboxes-2-4").prop("checked","checked");
            //$("#checkboxes-2-4").removeAttr("disabled");   			
		}*/
    });
    function disableMapTypes(){
        $("input[name=maptype]").each(function() {
            $(this).attr('checked', false);
        });
    }
    allNextBtn.click(function(){
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            //curInputs = curStep.find("input[type='radio'],input[type='text'],input[type='url'],input[type='checkbox']"),
            chkBox = curStep.find("input[type='checkbox']"),
            curInputs = curStep.find("input[name='platform'],input[name='components'],input[name='devices'],input[name='pub']"),
            isValid = true; 
        $(".form-group").removeClass("has-error");
        for(var i=0; i<curInputs.length; i++){            
            if (!curInputs[i].validity.valid){
                isValid = false;
                $(curInputs[i]).closest(".form-group").addClass("has-error");
            }
        }
        if(curStepBtn =="step-3"){
            logConfig = {};
            $("input").each(function() {
                if($(this).attr('name') != "platform" && $(this).attr('name') != "pub")
                {
                    /*if(typeof(logConfig[$(this).attr('name')]) != "object"){
                        var temp = logConfig[$(this).attr('name')];
                        temp[$(this).val()] = $(this)[0].checked;
                    }*/
                    if(!logConfig[$(this).attr('name')])
                        logConfig[$(this).attr('name')] = {};
                    logConfig[$(this).attr('name')][$(this).val()] = $(this)[0].checked;
                }else{
                   if($(this)[0].checked)
                        logConfig[$(this).attr('name')] = $(this).val();
                }
            });
                  
            //Mobile data adapter
			if(logConfig.platform == "mobile"){
                logConfig.components["map"] = true;
				for(var i in logConfig.components){
					if(i == "devices")
					{
						logConfig.components["list"] = logConfig.components[i];
						delete logConfig.components[i];
					}
					if(i == "alerts")
					{
						logConfig.components["alert"] = logConfig.components[i];
						delete logConfig.components[i];
					}
					if(i == "rules")
					{
						logConfig.components["rule"] = logConfig.components[i];
						delete logConfig.components[i];
					}
				}
				for(var i in logConfig.devices){
					if(i == "Light")
					{
						logConfig.devices["lights"] = logConfig.devices[i];
						delete logConfig.devices[i];
					}
					if(i == "Cameras")
					{
						logConfig.devices["video"] = logConfig.devices[i];
						delete logConfig.devices[i];
					}
                    if(i == "Routes")
					{
						logConfig.devices["congestion"] = logConfig.devices[i];
						delete logConfig.devices[i];
					}
                    if(i == "Sensors")
					{
						logConfig.devices["traffic"] = logConfig.devices[i];
						delete logConfig.devices[i];
					}
				}
			}
            console.log(logConfig);
            //Read a remote zip file
            var cfgFileName = "config.json";
            if(logConfig.platform == "mobile")
                cfgFileName = "TSConfig.json";
            JSZipUtils.getBinaryContent(logConfig.platform+'_ui_sdk.zip', function(err, data) {
                if(err) {
                    throw err; // or handle err
                }
                var zip = new JSZip();
                zip.loadAsync(data).then(function(zip){
                    var config;
					if(logConfig.platform=="mobile")
						config = zip.folder("ThingspaceSDK")
					else
						config = zip.folder("src");
                    config.file(cfgFileName,JSON.stringify(logConfig));
                    zip.generateAsync({type:"blob"})
                    .then(function(content) {
                        saveAs(content, logConfig.platform+"_ui_sdk.zip");
                    });
                });
            });
        }     
        if (isValid)
            nextStepWizard.removeAttr('disabled').trigger('click');
    });

    allPrevBtn.click(function(){
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            prevStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().prev().children("a");
        /*if(curStepBtn == "step-2"){
            logConfig.components = [];
        }*/
        $(".form-group").removeClass("has-error");
        prevStepWizard.removeAttr('disabled').trigger('click');
    });

    $('div.setup-panel div a.btn-primary').trigger('click');
});