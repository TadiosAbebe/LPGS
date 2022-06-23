// getting the html elements
const btn_open = document.getElementById("btn_open");
const btn_clear = document.getElementById("btn_clear");
const btn_save = document.getElementById("btn_save");
const open_file = document.getElementById("open_file");
const plate_no = document.getElementById("plate_no");
const btn_generate = document.getElementById("btn_generate");
const btn_remove = document.getElementById("btn_remove");
const canvas_container = document.getElementById("canvas_container");
const region = document.getElementById("region");
const code = document.getElementById("code");
const btn_clear_2 = document.getElementById("btn_clear_2");

/* global variables */
let active_img, img_ratio;

/* mapping the open button to the choose file button */
btn_open.addEventListener("click", () => {
	open_file.click();
});

/* clears the main canvas using fabrics clear method */
btn_clear.addEventListener("click", () => {
	canvas.clear();
});

/* clears the plate canvas using fabrics clear method */
btn_clear_2.addEventListener("click", () => {
	plate_canvas.clear();
});

/* downloads the image as a canvas */
btn_save.addEventListener("click", () => {
	save_canvas(canvas).click();
});

/* initializing the main canvas */
const canvas = new fabric.Canvas("canvas", {
	/* setting the height and width of the canvas to be equal to its container
	this is important to adapt different screen size monitors */
	width: canvas_container.clientWidth,
	height: canvas_container.clientHeight,
	/* preserveObjectStacking allows to add multiple images without hidding them under another object */
	preserveObjectStacking: true,
});
/* initializing the plate canvas */
const plate_canvas = new fabric.Canvas("plate_preview");

open_file.addEventListener("change", (files) => {
	canvas.clear();
	open_file_fun(files);
});

const plate_handle = () => {
	let plate_param = {
		code: null,
		region: null,
		number: "",
		color: null,
		font_size: 80,
		top: null,
		left: null,
		length: null,
	};
	code.addEventListener("change", () => {
		set_font_color(plate_param);
	});
	region.addEventListener("change", () => {
		plate_param.region = region.value;
	});
	plate_no.addEventListener("input", () => {
		plate_param.number = plate_no.value.toUpperCase();
		plate_param.length = plate_no.value.length;
	});
	btn_generate.addEventListener("click", () => {
		var font = new FontFaceObserver("Glyphter");
		font.load().then(
			() => {
				plate_canvas.clear();
				creat_plate(plate_param);
			},
			() => {
				console.log("Font is not available");
			}
		);
	});
	btn_add.addEventListener("click", () => {
		remove_plate();
		var objs = plate_canvas.getObjects().map(function (o) {
			return o.set("active", true);
		});
		var group = new fabric.Group(objs);
		canvas.add(group);
		canvas.centerObject(group);
	});
	btn_remove.addEventListener("click", () => {
		remove_plate();
	});
};
plate_handle();
const canvas_panning = () => {
	// zoom in and out of canvas when mouse wheel adjusted
	canvas.on("mouse:wheel", function (opt) {
		var evt = opt.e;
		if (evt.ctrlKey !== true) return;

		var delta = opt.e.deltaY;
		var zoom = canvas.getZoom();
		zoom *= 0.999 ** delta;
		if (zoom > 20) zoom = 20;
		if (zoom < 0.01) zoom = 0.01;
		canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
		opt.e.preventDefault();
		opt.e.stopPropagation();
		// console.log(Math.round(zoom * 100));
	});
	canvas.on("mouse:down", function (opt) {
		var evt = opt.e;
		if (evt.ctrlKey !== true) return;
		this.isDragging = true;
		this.selection = false;
		this.lastPosX = evt.clientX;
		this.lastPosY = evt.clientY;
	});
	canvas.on("mouse:move", function (opt) {
		if (this.isDragging) {
			var e = opt.e;
			var vpt = this.viewportTransform;
			vpt[4] += e.clientX - this.lastPosX;
			vpt[5] += e.clientY - this.lastPosY;
			this.requestRenderAll();
			this.lastPosX = e.clientX;
			this.lastPosY = e.clientY;
		}
	});
	canvas.on("mouse:up", function (opt) {
		// on mouse up we want to recalculate new interaction
		// for all objects, so we call setViewportTransform
		this.setViewportTransform(this.viewportTransform);
		this.isDragging = false;
		this.selection = true;
	});
};
canvas_panning();

function remove_plate() {
	/* iterate over all object in canvas */
	canvas._objects.forEach(check_obj);
	/* checks if the object is a group or not by calling the _objects property and if an object exists as a group
	remove that object since the licence plate we add is a group of object of the background and the number */
	function check_obj(obj) {
		if (obj._objects) {
			canvas.remove(obj);
		}
	}
}

function creat_plate(plate_param) {
	if (plate_param.length === 6) {
		plate_param.top = 17;
		plate_param.left = 126;
		plate_param.font_size = 86;
	} else if (plate_param.length === 5) {
		plate_param.top = 16;
		plate_param.left = 170;
		plate_param.font_size = 86;
	}
	if (plate_param.code === null) return console.log("no code selected");
	var plate = new fabric.Text(plate_param.number, {
		left: plate_param.left,
		top: plate_param.top,
		fontSize: plate_param.font_size,
		fontFamily: "Glyphter",
		fill: plate_param.color,
		charSpacing: 50,
		selectable: true,
		stroke: "#dddada",
		strokeWidth: 2,
		opacity: 0.9,
	});
	fabric.Image.fromURL(
		`src/img/licences/${plate_param.code}.png`,
		function (oImg) {
			oImg.scaleToWidth(plate_canvas.width, false);
			// oImg.scaleToHeight(plate_canvas.height, false);
			plate_canvas.add(oImg);
			plate_canvas.add(plate);
		},
		{
			selectable: false,
			opacity: 0.9,
		}
	);
}

function save_canvas(canvas) {
	let link = document.createElement("a");
	link.href = canvas.toDataURL({
		format: "png",
		enableRetinaScaling: true,
	});
	link.download = "Vechile.png";
	return link;
}

function open_file_fun(files) {
	const reader = new FileReader(); /* read the file selected as a data url */
	reader.addEventListener("load", () => {
		open_img(reader.result);
	});
	reader.readAsDataURL(files.target.files[0]);
}

/* create an image from the given source */
function open_img(img_src) {
	fabric.Image.fromURL(img_src, (e) => {
		canvas.clear();
		active_img = e;
		e.scaleToHeight(canvas.height, false);
		// e.scaleToWidth(canvas.width, false);
		canvas.add(e);
		canvas.centerObject(e);
		canvas.renderAll();
	});
}

function set_font_color(plate_param) {
	plate_param.code = code.value;
	switch (plate_param.code) {
		case "code1":
			plate_param.color = "rgb(181,69,31)";
			break;
		case "code2":
			plate_param.color = "rgb(39,71,159)";
			break;
		case "code3":
			plate_param.color = "rgb(50,97,0)";
			break;
		case "code4":
			// plate_param.color = "rgb(3, 3, 3)";
			plate_param.color = "rgb(18,18,18)";
			break;
		case "code5":
			plate_param.color = "rgb(234,66,4)";
			break;
		case "codeun":
			plate_param.color = "rgb(0,156,206)";
			break;
		case "codeau":
			plate_param.color = "rgb(9,175,181)";
			break;
		case "codeet":
			plate_param.color = "rgb(0,156,206)";
			break;
		default:
			plate_param.color = "rgb(0,0,0)";
			break;
	}
}
