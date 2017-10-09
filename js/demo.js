var dial = $('#dial');
var angle = 0;
var rolemode = 0; //observer=0, reporter=1

var hyperDial;

let config = {
        "development": true,
        "runtimeURL": "hyperty-catalogue://catalogue.hybroker.rethink.ptinovacao.pt/.well-known/runtime/Runtime",
        "domain": "hybroker.rethink.ptinovacao.pt"
};

let runtime;
let CatalogueURLreporter = 'hyperty-catalogue://' + config.domain + '/.well-known/hyperty/HelloWorldReporter';
let CatalogueURLobserver = 'hyperty-catalogue://' + config.domain + '/.well-known/hyperty/HelloWorldObserver';



$( "input[name='role']")[0].checked = true;
$( "input[name='role']")[1].checked = false;

$( "input[name='role']" ).click(function () {
	for (let i = 0; i<2;i++) {
		let option = $( "input[name='role']")[i];
		if (option.value == 'reporter' && option.checked) {
			$("#repSet").show();
			$("#obsSet").hide();
			rolemode = 1;
		} else if (option.value == 'observer' && option.checked) {
			$("#repSet").hide();
			$("#obsSet").show();
			rolemode = 0;
		}
	}
	rethink.default.install(config).then(function(result) {
		runtime = result;
		
		if (rolemode == 0)
			deployHyperty(CatalogueURLobserver);
		else if (rolemode == 1)
			deployHyperty(CatalogueURLreporter);
		
		}).catch(function(reason) {
			console.error(reason);
	});

});



function deployHyperty(CatURL) {
	runtime.requireHyperty(CatURL).then(function(hyperty) {
		startUsingDeployedHperty(hyperty);
	}).catch(function(reason) {
		console.error(reason);
	});
}

function startUsingDeployedHperty(hyperty) {
	hyperDial = hyperty.instance;
	if (rolemode == 0) {
		var observerURL = hyperty.runtimeHypertyURL;
		$("#myURL").text(observerURL);
		console.log("heads up!!!"+observerURL);
		
		hyperDial.addEventListener('invitation', function(identity) {
    		JSON.stringify(identity);
    		console.log('Hello event received from:', identity);
 		});
 		
  		hyperDial.addEventListener('hello', function(event) {

    		console.log('Hello event received:', event);    
    		console.log("wtf..."+event);
    		angle = event.hello;
    		updateDialer();
  		});

  		console.log('Observer Waiting for Hello!!');

		
	}
	else if (rolemode == 1) {
		$("#startLink").on('click', startDial); 
	
	}

}

function startDial(event) {
	event.preventDefault();
	let toHyperty = $(".to-hyperty-input").val();

	//console.log("WHATATAA FAAACK!!!!"+toHyperty);
	
	hyperDial.hello(toHyperty).then(function(helloObject) {
		console.log("sent something?");
	}).catch(function(reason) {
		console.error(reason);
	});

}



function updateDialer() {
	if (angle < 0)
		angle += 360;
	if (angle > 360)
		angle -= 360;
	dial.css({
		'-moz-transform' : 'rotate(' + angle + 'deg)',
		'-webkit-transform' : 'rotate(' + angle + 'deg)',
		'-o-transform' : 'rotate(' + angle + 'deg)',
		'-ms-transform' : 'rotate(' + angle + 'deg)',
		'transform' : 'rotate(' + angle + 'deg)'
	});
	if (rolemode == 1)
		hyperDial.bye(angle);
}

document.onkeypress = function(evt) {
	evt = evt || window.event;
	var charCode = evt.keyCode || evt.which;
	var charStr = String.fromCharCode(charCode);
	if (charStr == '+') {
		angle += 2;
	} else if (charStr == '-') {
		angle -= 2;
	}
	updateDialer();
};

