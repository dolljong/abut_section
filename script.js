document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('abutmentCanvas');
    const ctx = canvas.getContext('2d');

    const inputs = {
        breastWallThickness: document.getElementById('breastWallThickness'),
        breastWallHeight: document.getElementById('breastWallHeight'),
        wallThickness: document.getElementById('wallThickness'),
        wallHeight: document.getElementById('wallHeight'),
        foundationThickness: document.getElementById('foundationThickness'),
        frontToeLength: document.getElementById('frontToeLength'),
        backHeelLength: document.getElementById('backHeelLength'),
        showGuideLines: document.getElementById('showGuideLines'),
        drawButton: document.getElementById('drawButton'),
    };

    function drawAbutment() {
        // --- 1. Get and Parse Input Values ---
        const dims = {};
        for (const key in inputs) {
            if (key === 'drawButton' || key === 'showGuideLines') continue;
            const value = parseFloat(inputs[key].value);
            if (isNaN(value) || value < 0) {
                alert(`"${inputs[key].id}"에 유효한 양수를 입력해주세요.`);
                return;
            }
            dims[key] = value;
        }
        const showGuideLines = inputs.showGuideLines.checked;

        if (dims.breastWallThickness > dims.wallThickness) {
            alert("흉벽두께는 벽체두께보다 클 수 없습니다.");
            return;
        }

        // --- 2. Calculate Scale and Centering ---
        const dimOffset = 2000;
        const textGap = 800;

        const abutmentWidth = dims.frontToeLength + dims.wallThickness + dims.backHeelLength;
        const abutmentHeight = dims.foundationThickness + dims.wallHeight + dims.breastWallHeight;

        // Overhang is now drawn *inside* the dimOffset, so it doesn't contribute to total size
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
            { x: drawingOffsetX, y: drawingOffsetY + s(dims.breastWallHeight + dims.wallHeight + dims.foundationThickness) },
            { x: drawingOffsetX + s(abutmentWidth), y: drawingOffsetY + s(dims.breastWallHeight + dims.wallHeight + dims.foundationThickness) },
            { x: drawingOffsetX + s(abutmentWidth), y: drawingOffsetY + s(dims.breastWallHeight + dims.wallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength + dims.wallThickness), y: drawingOffsetY + s(dims.breastWallHeight + dims.wallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength + dims.wallThickness), y: drawingOffsetY + s(dims.breastWallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength + dims.wallThickness), y: drawingOffsetY },
            { x: drawingOffsetX + s(dims.frontToeLength + dims.wallThickness - dims.breastWallThickness), y: drawingOffsetY },
            { x: drawingOffsetX + s(dims.frontToeLength + dims.wallThickness - dims.breastWallThickness), y: drawingOffsetY + s(dims.breastWallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength), y: drawingOffsetY + s(dims.breastWallHeight) },
            { x: drawingOffsetX + s(dims.frontToeLength), y: drawingOffsetY + s(dims.breastWallHeight + dims.wallHeight) },
            { x: drawingOffsetX, y: drawingOffsetY + s(dims.breastWallHeight + dims.wallHeight) },
        ];

        // --- 4. Draw Everything ---
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

        drawHorizontalDimensions(dims, scale, drawingOffsetY, p, showGuideLines);
        drawVerticalDimensions(dims, scale, drawingOffsetX, p, showGuideLines);
    }

    function drawArrowhead(ctx, x, y, radius) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    function drawVerticalDimensions(dims, scale, drawingOffsetX, p, showGuideLines) {
        const s = (dim) => dim * scale;
        const dimensionLineX = drawingOffsetX - s(2000);
        const overhangLength = s(1000);
        const arrowheadRadius = s(50);
        const textX = dimensionLineX - 15;

        ctx.lineWidth = 1;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const yLevels = { breastTop: p[5].y, wallTop: p[4].y, foundationTop: p[10].y, foundationBottom: p[0].y };
        const segments = [
            { start: yLevels.breastTop, end: yLevels.wallTop, label: dims.breastWallHeight },
            { start: yLevels.wallTop, end: yLevels.foundationTop, label: dims.wallHeight },
            { start: yLevels.foundationTop, end: yLevels.foundationBottom, label: dims.foundationThickness }
        ];

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(dimensionLineX, yLevels.breastTop);
        ctx.lineTo(dimensionLineX, yLevels.foundationBottom);
        ctx.stroke();

        const extensionLineOriginX = p[10].x;
        Object.values(yLevels).forEach(y => {
            if (showGuideLines) {
                ctx.strokeStyle = '#888';
                ctx.beginPath();
                ctx.moveTo(extensionLineOriginX, y);
                ctx.lineTo(dimensionLineX, y);
                ctx.stroke();
            }
            ctx.strokeStyle = '#888';
            ctx.beginPath();
            ctx.moveTo(dimensionLineX, y);
            ctx.lineTo(dimensionLineX + overhangLength, y); // Towards structure
            ctx.stroke();

            drawArrowhead(ctx, dimensionLineX, y, arrowheadRadius);
        });

        segments.forEach(seg => {
            if (seg.label > 0) ctx.fillText(seg.label.toString(), textX, (seg.start + seg.end) / 2);
        });
    }

    function drawHorizontalDimensions(dims, scale, drawingOffsetY, p, showGuideLines) {
        const s = (dim) => dim * scale;
        const dimensionLineY = drawingOffsetY - s(2000);
        const overhangLength = s(1000);
        const arrowheadRadius = s(50);
        const textY = dimensionLineY - 15;

        ctx.lineWidth = 1;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const xCoords = {
            frontToeStart: p[10].x, wallFront: p[9].x, breastWallFront: p[6].x,
            wallBack: p[5].x, backHeelEnd: p[2].x
        };
        const segments = [
            { start: xCoords.frontToeStart, end: xCoords.wallFront, from: p[10], to: p[9], label: dims.frontToeLength },
            { start: xCoords.wallFront, end: xCoords.breastWallFront, from: p[8], to: p[6], label: dims.wallThickness - dims.breastWallThickness },
            { start: xCoords.breastWallFront, end: xCoords.wallBack, from: p[6], to: p[5], label: dims.breastWallThickness },
            { start: xCoords.wallBack, end: xCoords.backHeelEnd, from: p[3], to: p[2], label: dims.backHeelLength }
        ];

        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(xCoords.frontToeStart, dimensionLineY);
        ctx.lineTo(xCoords.backHeelEnd, dimensionLineY);
        ctx.stroke();

        const allXPoints = new Map();
        segments.forEach(seg => {
            allXPoints.set(seg.start, seg.from);
            allXPoints.set(seg.end, seg.to);
        });

        allXPoints.forEach((structurePoint, dimLineX) => {
            if (showGuideLines) {
                ctx.strokeStyle = '#888';
                ctx.beginPath();
                ctx.moveTo(structurePoint.x, structurePoint.y);
                ctx.lineTo(dimLineX, dimensionLineY);
                ctx.stroke();
            }
            ctx.strokeStyle = '#888';
            ctx.beginPath();
            ctx.moveTo(dimLineX, dimensionLineY);
            ctx.lineTo(dimLineX, dimensionLineY + overhangLength); // Towards structure
            ctx.stroke();

            drawArrowhead(ctx, dimLineX, dimensionLineY, arrowheadRadius);
        });

        segments.forEach(seg => {
            if (seg.label > 0) ctx.fillText(seg.label.toString(), (seg.start + seg.end) / 2, textY);
        });
    }

    inputs.drawButton.addEventListener('click', drawAbutment);
    inputs.showGuideLines.addEventListener('change', drawAbutment);
    drawAbutment();
});