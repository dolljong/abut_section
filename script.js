document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('abutmentCanvas');
    const ctx = canvas.getContext('2d');
    const drawButton = document.getElementById('drawButton');

    const inputs = {
        breastWallThickness: document.getElementById('breastWallThickness'),
        breastWallHeight: document.getElementById('breastWallHeight'),
        wallThickness: document.getElementById('wallThickness'),
        wallHeight: document.getElementById('wallHeight'),
        foundationThickness: document.getElementById('foundationThickness'),
        frontToeLength: document.getElementById('frontToeLength'),
        backHeelLength: document.getElementById('backHeelLength'),
    };

    function drawAbutment() {
        // --- 1. Get and Parse Input Values ---
        const dims = {};
        for (const key in inputs) {
            const value = parseFloat(inputs[key].value);
            if (isNaN(value) || value < 0) {
                alert(`"${inputs[key].id}"에 유효한 양수를 입력해주세요.`);
                return;
            }
            dims[key] = value;
        }

        if (dims.breastWallThickness > dims.wallThickness) {
            alert("흉벽두께는 벽체두께보다 클 수 없습니다.");
            return;
        }

        // --- 2. Calculate Scale and Centering ---
        const dimOffset = 1000; // Offset from structure to dimension line
        const textGap = 800;   // Gap for text to prevent overlap

        const abutmentWidth = dims.frontToeLength + dims.wallThickness + dims.backHeelLength;
        const abutmentHeight = dims.foundationThickness + dims.wallHeight + dims.breastWallHeight;

        const totalDrawingWidth = abutmentWidth + dimOffset + textGap;
        const totalDrawingHeight = abutmentHeight + dimOffset + textGap;

        const padding = 50;
        const canvasContentWidth = canvas.width - 2 * padding;
        const canvasContentHeight = canvas.height - 2 * padding;

        const scale = Math.min(canvasContentWidth / totalDrawingWidth, canvasContentHeight / totalDrawingHeight);
        const s = (dim) => dim * scale;

        const sTotalDrawingWidth = totalDrawingWidth * scale;
        const sTotalDrawingHeight = totalDrawingHeight * scale;
        const finalOffsetX = (canvas.width - sTotalDrawingWidth) / 2;
        const finalOffsetY = (canvas.height - sTotalDrawingHeight) / 2;

        // --- 3. Define Polygon Coordinates ---
        const drawingOffsetX = finalOffsetX + s(dimOffset + textGap);
        const drawingOffsetY = finalOffsetY + s(dimOffset + textGap);

        const p = [
            { x: drawingOffsetX, y: drawingOffsetY + s(dims.breastWallHeight) + s(dims.wallHeight) + s(dims.foundationThickness) },
            { x: drawingOffsetX + s(abutmentWidth), y: drawingOffsetY + s(dims.breastWallHeight) + s(dims.wallHeight) + s(dims.foundationThickness) },
            { x: drawingOffsetX + s(abutmentWidth), y: drawingOffsetY + s(dims.breastWallHeight) + s(dims.wallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength) + s(dims.wallThickness), y: drawingOffsetY + s(dims.breastWallHeight) + s(dims.wallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength) + s(dims.wallThickness), y: drawingOffsetY + s(dims.breastWallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength) + s(dims.wallThickness), y: drawingOffsetY },
            { x: drawingOffsetX + s(dims.frontToeLength) + s(dims.wallThickness) - s(dims.breastWallThickness), y: drawingOffsetY },
            { x: drawingOffsetX + s(dims.frontToeLength) + s(dims.wallThickness) - s(dims.breastWallThickness), y: drawingOffsetY + s(dims.breastWallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength), y: drawingOffsetY + s(dims.breastWallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength), y: drawingOffsetY + s(dims.breastWallHeight) + s(dims.wallHeight) },
            { x: drawingOffsetX, y: drawingOffsetY + s(dims.breastWallHeight) + s(dims.wallHeight) },
        ];

        // --- 4. Draw Abutment and Dimensions ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) { ctx.lineTo(p[i].x, p[i].y); }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        drawHorizontalDimensions(dims, scale, drawingOffsetX, drawingOffsetY, p);
        drawVerticalDimensions(dims, scale, drawingOffsetX, drawingOffsetY, p);
    }

    function drawVerticalDimensions(dims, scale, drawingOffsetX, drawingOffsetY, p) {
        const s = (dim) => dim * scale;
        const dimensionLineX = drawingOffsetX - s(1000);
        const textX = dimensionLineX - 10;
        const tickSize = 5;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const yLevels = { breastTop: p[5].y, wallTop: p[4].y, foundationTop: p[10].y, foundationBottom: p[0].y };
        const segments = [
            { start: yLevels.breastTop, end: yLevels.wallTop, label: dims.breastWallHeight },
            { start: yLevels.wallTop, end: yLevels.foundationTop, label: dims.wallHeight },
            { start: yLevels.foundationTop, end: yLevels.foundationBottom, label: dims.foundationThickness }
        ];

        ctx.beginPath();
        ctx.moveTo(dimensionLineX, yLevels.breastTop);
        ctx.lineTo(dimensionLineX, yLevels.foundationBottom);
        ctx.stroke();

        const extensionLineOriginX = p[10].x;
        [yLevels.breastTop, yLevels.wallTop, yLevels.foundationTop, yLevels.foundationBottom].forEach(y => {
            ctx.strokeStyle = '#888';
            ctx.beginPath();
            ctx.moveTo(extensionLineOriginX, y);
            ctx.lineTo(dimensionLineX, y); // Line goes from structure to dimension line
            ctx.stroke();

            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(dimensionLineX - tickSize, y);
            ctx.lineTo(dimensionLineX + tickSize, y);
            ctx.stroke();
        });

        segments.forEach(seg => {
            if (seg.label > 0) {
                ctx.fillText(seg.label.toString(), textX, (seg.start + seg.end) / 2);
            }
        });
    }

    function drawHorizontalDimensions(dims, scale, drawingOffsetX, drawingOffsetY, p) {
        const s = (dim) => dim * scale;
        const dimensionLineY = drawingOffsetY - s(1000);
        const textY = dimensionLineY - 10;
        const tickSize = 5;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const xCoords = {
            frontToeStart: p[10].x, wallFront: p[9].x, breastWallFront: p[6].x,
            wallBack: p[5].x, backHeelEnd: p[2].x
        };
        const segments = [
            { start: xCoords.frontToeStart, end: xCoords.wallFront, label: dims.frontToeLength, from: p[10], to: p[9] },
            { start: xCoords.wallFront, end: xCoords.breastWallFront, label: dims.wallThickness - dims.breastWallThickness, from: p[8], to: p[6] },
            { start: xCoords.breastWallFront, end: xCoords.wallBack, label: dims.breastWallThickness, from: p[6], to: p[5] },
            { start: xCoords.wallBack, end: xCoords.backHeelEnd, label: dims.backHeelLength, from: p[3], to: p[2] }
        ];

        ctx.beginPath();
        ctx.moveTo(xCoords.frontToeStart, dimensionLineY);
        ctx.lineTo(xCoords.backHeelEnd, dimensionLineY);
        ctx.stroke();

        segments.forEach(seg => {
            [seg.from, seg.to].forEach(point => {
                ctx.strokeStyle = '#888';
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(point.x, dimensionLineY); // Line goes from structure to dimension line
                ctx.stroke();
            });

            [seg.start, seg.end].forEach(x => {
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(x, dimensionLineY - tickSize);
                ctx.lineTo(x, dimensionLineY + tickSize);
                ctx.stroke();
            });

            if (seg.label > 0) {
                ctx.fillText(seg.label.toString(), (seg.start + seg.end) / 2, textY);
            }
        });
    }

    drawButton.addEventListener('click', drawAbutment);
    drawAbutment();
});