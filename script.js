cnvs = document.getElementById("cnvs")
ctx = cnvs.getContext("2d")

function resize(){
    cnvs.width = cnvs.height = Math.min(innerWidth, innerHeight)
    ss = cnvs.width / gridSize
}

window.addEventListener("resize", resize)

gridSize = 32

resize()

function initGrid(){
    grid = []
    for (var ri = 0; ri < gridSize; ri++){
        var r = []
        for (var ci = 0; ci < gridSize; ci++){
            r.push(0)
        }
        grid.push(r)
    }
}

initGrid()


rsz = 3 //rand size
ptrns = patterns(rsz)

cnt = 0
ptn = 1
drawPattern(ptrns[0])

setInterval(function(){
    if (cnt < 50){
        tick()
        cnt++;
    } else {
        initGrid()
        drawPattern(ptrns[ptn])
        ptn = (ptn+1)%Math.pow(2,rsz*rsz);
        cnt = 0;
    }
}, 10)

function patterns(n){
    var ptrns = []
    var l = Math.pow(2, n*n)
    for (var i = 0; i < l; i++){
        var rws = (i).toString(2).padStart(n*n, '0').match(new RegExp('.{1,'+n+'}', 'g'))
        var ptrn = []
        for (var ri = 0; ri < n; ri++){
            var r = []
            for (var ci = 0; ci < n; ci++){
                r.push(parseInt(rws[ri][ci]))
            }
            ptrn.push(r)
        }
        ptrns.push(ptrn)
    }
    return ptrns
}

function drawPattern(ptrn){
    for (var r = 0; r < ptrn.length; r++){
        for (var c = 0; c < ptrn.length; c++){
            var b = Math.floor(gridSize/2-ptrn.length/2)
            grid[b+r][b+c] = ptrn[r][c]
        }
    }
    draw()
}

function tick(){
    var gridCpy = []
    for (var r = 0; r < gridSize; r++){
        gridCpy.push(grid[r].slice())
        for (var c = 0; c < gridSize; c++){
            nghbrs = [[r+1,c], [r+1,c+1], [r, c+1], [r-1,c+1], [r-1,c], [r-1,c-1], [r,c-1], [r+1,c-1]]
            nghbrs = nghbrs.filter(n => n[0] >= 0 && n[1] >= 0 && n[0] < gridSize && n[1] < gridSize)
            alv = nghbrs.filter(n => grid[n[0]][n[1]])
            if (grid[r][c] && alv.length == 2 || alv.length == 3){
                gridCpy[r][c] = 1
            } else if (alv.length == 3){
                gridCpy[r][c] = 1
            } else {
                gridCpy[r][c] = 0
            }
        }
    }
    grid = gridCpy
    draw()
}

function fill(r, c){
    ctx.fillStyle = "white"
    ctx.fillRect(c * ss, r * ss, ss, ss)
}

function draw(){
    ctx.clearRect(0, 0, cnvs.width, cnvs.height)
    for (var r = 0; r < gridSize; r++){
        for (var c = 0; c < gridSize; c++){
            if (grid[r][c]) fill(r, c)
        }
    }
}

cnvs.addEventListener("click", function (e){
    var r = Math.floor(e.offsetY / ss)
    var c = Math.floor(e.offsetX / ss)
    grid[r][c] = 1
    draw()
})
