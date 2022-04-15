let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let canvas2 = document.getElementById("two");
let ctx2 = canvas2.getContext("2d");

canvas2.style.display = false;

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;




function dot(x, y, ctx, color=[0,0,0,255]) {
    // let id = ctx.createImageData(1,1);
    // let d = id.data;
    // d[0] = 0;
    // d[1] = 0;
    // d[2] = 0;
    // d[3] = 255;

    let id = new ImageData(new Uint8ClampedArray(color), 1, 1)
    // console.log(x,y, "12345")
    ctx.putImageData(id, Math.ceil(x), Math.ceil(y))

}

function dda(x, y, dx, dy, ctx) {
    let slope = (dy-y) / (dx-x);

    y = y + 0.5;

    while(x <= dx) {
        console.log(x, Math.ceil(y))
        dot(x, y, ctx);
        y = y + slope;
        x = x + slope;
    }
}

function lab(x1, y1, x2, y2, ctx) {
    let x = x1;
    let y = y1;

    let dx = x2 - x1;
    let dy = y2 - y1;


    dot(x, y, ctx);
    let count = dx;

    while (count > 0) {
        count -= 1;

        if (dy * (x+1) - dx * (y+0.5) - (x1 * dy - y1 * dx) > 0 ) {
            y = y + 1;
        }

        x = x + 1;

        dot(x,y, ctx);
    }


}

function set_pixel4(x0, y0, r, ctx){
    dot(x0, y0 + r, ctx)
    dot(x0, y0 - r, ctx)
    dot(x0 + r, y0, ctx)
    dot(x0 - r, y0, ctx)
}

function set_pixel8(x0, y0, x, y, ctx){
    dot(x0 + x, y0 + y, ctx)
    dot(x0 - x, y0 + y, ctx)
    dot(x0 + x, y0 - y, ctx)
    dot(x0 - x, y0 - y, ctx)

    dot(x0 + y, y0 + x, ctx)
    dot(x0 - y, y0 + x, ctx)
    dot(x0 + y, y0 - x, ctx)
    dot(x0 - y, y0 - x, ctx)
}


function cab(x0,y0,r, ctx) {

    function f(x,y,r){
        return x**2 + y**2 - r**2
    }
    let x = 0;
    let y = r;

    set_pixel4(x0,y0,r, ctx);
    while(x<=y) {
        console.log(x,y,f(x+1, y-0.5, r))
        if (f(x+1, y-0.5, r) < 0) {
            y++;
        }

        y--;
        x++;
        set_pixel8(x0, y0, x, y, ctx);

    }

}

function img_drow(src, ctx, f){
    let img = new Image();

    img.onload = function(){
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height)
    }
    img.src = src;

    return img
}

function getcolor(x,y, ctx) {
    return ctx.getImageData(x,y,1,1).data
}

function fixed_thresholding(ctx, ctx_res, m=255){
    let c = getcolor(0,0,ctx)
    console.log(c)
    for (let y = 0; y < ctx.canvas.width; y++) {
        for (let x = 0; x < ctx.canvas.height; x++) {
            let c = getcolor(x,y,ctx)

            if (c[0]+c[1]+c[2] < m) {
                // console.log(c[0]+c[1]+c[2])
                dot(x, y, ctx_res)
            }
            else {
                dot(x,y,ctx_res,[255,255,255,255])
            }
        }
    }
}

function random_thresholding(ctx, ctx_res){
    let c = getcolor(0,0,ctx)
    console.log(c)
    for (let y = 0; y < ctx.canvas.width; y++) {
        for (let x = 0; x < ctx.canvas.height; x++) {
            let c = getcolor(x,y,ctx)

            if (c[0]+c[1]+c[2] < Math.floor(Math.random()*255*3)) {
                // console.log(c[0]+c[1]+c[2])
                dot(x, y, ctx_res)
            }
            else {
                dot(x,y,ctx_res,[255,255,255,255])
            }
        }
    }
}



function split_view(c1, c2){
    c1.canvas.style.display = "block";
    c2.canvas.style.display = "block";

    c1.canvas.style.width = "50%";
    c2.canvas.style.width = "50%";

    c1.canvas.width = c1.canvas.width/2
    c2.canvas.width = c1.canvas.width
    c2.canvas.height = c1.canvas.height

    c1.canvas.style.float = "left"
}



function onLoadHandler() {
    // ctx.transform(1, 0, 0, -1, 0, 0)



    // dot(10, 10, ctx);
    // dda(0,0,100,100, ctx);
    // lab(0,0,100,100, ctx)

    // cab(100,100,20, ctx)
    // img_drow("img.png", ctx, ()=>{})
    split_view(ctx,ctx2)

    img_drow("img.png", ctx)

    // random_thresholding(ctx,ctx2)
    console.log(getcolor(0,0,ctx))
    // dot(0,0, ctx2)

}

window.onload = onLoadHandler;