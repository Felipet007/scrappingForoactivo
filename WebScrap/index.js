//NECESARIO INSTALAR OSMOSIS (npm install osmosis. Visita la página oficial de Node para ver la sentencia)

var http = require("http");
const osmosis = require("osmosis");
var fs = require("fs");

var lista;
var coleccionPost = [];
var cookies;


//TRAMA Y USUARIO
var user = "Kyle MacConaill";
var trama = "Aguatierra";


var server = http.createServer(function(request,response){
	response.writeHead(200,{"Content-Type":"text/plain"});
	
	console.log("NEW SEARCH");
	
	//HACEMOS SCRAP	
	
	//Si las cookies es == null es sporque es la primera vez que entramos. Si no, quiere decir que ya estamos logueados
	if(cookies == null){
		osmosis.get('http://avam-rpg.foroactivo.com/login')
		.login("USERNAME", "PASSWORD") //IMPORTANT
		.success('#container')
		.then((context)=>{
			cookies = context.cookies;
			osmosis
			.config('cookies', context.cookies);
			osmosis
			.headers(context.request.headers);
			
			scrapeData();
		})
		.fail('#container')
		.then((context)=>{
			scrapeData();
		})
		.log(console.log)
		.error(console.log)
		.debug(console.log);
	} else {
		scrapeData();
	}
		
		function scrapeData(){
			
			var indexPost = 0;
			var indexMaxPost = 400;
			
			//los enlaces estan partidos porque entre ellos dos se añade la página y el post máximo de cada una. 
			//Es la forma que tiene foractivo de identificar sus html. La primera página de un post no lleva nada, así que
			//para configuarar esto, deberás mirar la ULTIMA página del tema.
			var enlacePrimero = 'http://avam-rpg.foroactivo.com/t4080';
			var enlaceSegundo = '-aguatierra';
			var enlaceTotal = "";
			
			while(indexPost<=indexMaxPost){
				
				if(indexPost == 0){
					enlaceTotal = enlacePrimero + enlaceSegundo;
				} else {
					enlaceTotal = enlacePrimero + "p" + indexPost + enlaceSegundo;
				}
				
				osmosis
				.get(enlaceTotal)
				.find(".postbody") //de todos los divs con esta clase...
				.set({
					'author' : '.postprofile-username a span strong',
					'post':'.topictitle-info a@href'}) //rescatame los href del enlace dentro de este otro div
				.data(function(listing) { //método que le pasa el objeto creado y donde puedo hacer cosas. UNO POR CADA COINCIDENCIA
					lista = listing;
					console.log(lista);
					saveResearch(lista);
					
				})
				.log(console.log)
				.error(console.log)
				.debug(console.log);
				
				indexPost = indexPost + 25; //el +25 podría cambiar a otro valor, depende del máximo de post por página. Normalmente es 25, pero también puede ser 10, 50, etc
				
			}
			
			setTimeout(function () {
				console.log("salgo del bucle");
				displayResearch();
			}, 5000);
			
		}
		
	
});

var port = process.env.PORT || 8081;
server.listen(port);

console.log("Servidor en marcha en el puerto " + port);

//Mira si el autor es el que queremos. Si lo es, lo añade al array. Si no, lo descarta
function saveResearch(lista){
	if(lista.author == user){
		coleccionPost.push("http://avam-rpg.foroactivo.com" + lista.post);
	}
	
}

//formatea el array a un formato legible y lo guarda en un fichero
function displayResearch(){
	
	//TODO:
	//ORDENAR EL ARRAY
	
	orderCollection();
	
	fs.mkdir("output", (err) => {
	  if (err) {
		  
	  }
	});
	
	console.log(coleccionPost);
	
	var title = user.split(" ")[0] + "-";
	var tramaWithoutSpace = trama.split(" ");
	
	for(var y = 0; y<tramaWithoutSpace.length; y++){
		title = title + tramaWithoutSpace[y];
	}

	var archivo = fs.createWriteStream("output/"+title+".txt", {"flags":"a"});
	var cadenaPost = "Posts de " + user + " en " + trama + "\r\n\r\n";
	
	for(var x = 0; x<coleccionPost.length; x++){
		
		cadenaPost = cadenaPost + "[url="+coleccionPost[x]+"]Enlace "+(x+1)+"[/url]\r\n";
		
	}
	
	archivo.write(cadenaPost);
	
	//fs realiza la función de manera asíncrona. Nos esperamos un segundo de cortesía para
	//decirle al usuario que se ha generado el documento
	setTimeout(function () {
				console.log("Generado");
	}, 1000);
	
}

function orderCollection(){
	
	const l = coleccionPost.length;
	
	for(var i = 0 ; i<l ; i++) {
		for(var j = 0 ; j< l - 1 - i; j++) {
			var intJ = parseInt(coleccionPost[j].split("#")[1],10);
			var intSiguiente = parseInt(coleccionPost[j+1].split("#")[1],10);
			
			if(intJ>intSiguiente){
				[ coleccionPost[j], coleccionPost[j+1] ] = [ coleccionPost[j+1], coleccionPost[j] ];
			}
		}
	} 
	
	return coleccionPost;
	
	
}
