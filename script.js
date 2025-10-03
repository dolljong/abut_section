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
        const dimensionLineOffset = 2000; // Space above the abutment for dimension line
        const dimensionTextGap = 500;    // Additional gap for text readability
        const totalWidth = dims.frontToeLength + dims.wallThickness + dims.backHeelLength;
        const totalHeight = dims.foundationThickness + dims.wallHeight + dims.breastWallHeight + dimensionLineOffset + dimensionTextGap;

        const padding = 50; // Canvas padding in pixels
        const canvasContentWidth = canvas.width - 2 * padding;
        const canvasContentHeight = canvas.height - 2 * padding;

        const scale = Math.min(canvasContentWidth / totalWidth, canvasContentHeight / totalHeight);

        const s = {};
        for (const key in dims) {
            s[key] = dims[key] * scale;
        }
        const sTotalWidth = totalWidth * scale;
        const sTotalHeight = totalHeight * scale;

        const offsetX = (canvas.width - sTotalWidth) / 2;
        const offsetY = (canvas.height - sTotalHeight) / 2;

        // --- 3. Define Polygon Coordinates ---
        // We shift the entire drawing down to make space for the dimension lines at the top.
        const drawingOffsetY = offsetY + (dimensionLineOffset + dimensionTextGap) * scale;

        const p = [
            // P0: Bottom-left of foundation
            { x: offsetX, y: drawingOffsetY + s.breastWallHeight + s.wallHeight + s.foundationThickness },
            // P1: Bottom-right of foundation
            { x: offsetX + sTotalWidth, y: drawingOffsetY + s.breastWallHeight + s.wallHeight + s.foundationThickness },
            // P2: Top-right of foundation (at back heel)
            { x: offsetX + sTotalWidth, y: drawingOffsetY + s.breastWallHeight + s.wallHeight },
            // P3: Wall base back
            { x: offsetX + s.frontToeLength + s.wallThickness, y: drawingOffsetY + s.breastWallHeight + s.wallHeight },
            // P4: Wall top back
            { x: offsetX + s.frontToeLength + s.wallThickness, y: drawingOffsetY + s.breastWallHeight },
            // P5: Breast wall top back
            { x: offsetX + s.frontToeLength + s.wallThickness, y: drawingOffsetY },
            // P6: Breast wall top front
            { x: offsetX + s.frontToeLength + s.wallThickness - s.breastWallThickness, y: drawingOffsetY },
            // P7: Breast wall bottom front
            { x: offsetX + s.frontToeLength + s.wallThickness - s.breastWallThickness, y: drawingOffsetY + s.breastWallHeight },
            // P8: Wall top front
            { x: offsetX + s.frontToeLength, y: drawingOffsetY + s.breastWallHeight },
            // P9: Wall base front
            { x: offsetX + s.frontToeLength, y: drawingOffsetY + s.breastWallHeight + s.wallHeight },
            // P10: Foundation top front (at front toe)
            { x: offsetX, y: drawingOffsetY + s.breastWallHeight + s.wallHeight },
        ];

        // --- 4. Draw Abutment on Canvas ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#f0f0f0';

        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) {
            ctx.lineTo(p[i].x, p[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // --- 5. Draw Dimension Lines ---
        drawHorizontalDimensions(dims, scale, offsetX, drawingOffsetY, p);
    }

    function drawHorizontalDimensions(dims, scale, offsetX, drawingOffsetY, p) {
        const s = (dim) => dim * scale;
        const dimensionLineY = drawingOffsetY - s(2000);
        const textY = dimensionLineY - 10;
        const tickSize = 5;

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const xCoords = {
            frontToeStart: p[10].x,
            wallFront: p[9].x,
            breastWallFront: p[6].x,
            wallBack: p[5].x,
            backHeelEnd: p[2].x
        };

        const segments = [
            { start: xCoords.frontToeStart, end: xCoords.wallFront, label: dims.frontToeLength, from: p[10], to: p[9] },
            { start: xCoords.wallFront, end: xCoords.breastWallFront, label: dims.wallThickness - dims.breastWallThickness, from: p[8], to: p[6] },
            { start: xCoords.breastWallFront, end: xCoords.wallBack, label: dims.breastWallThickness, from: p[6], to: p[5] },
            { start: xCoords.wallBack, end: xCoords.backHeelEnd, label: dims.backHeelLength, from: p[3], to: p[2] }
        ];

        // Draw main horizontal dimension line
        ctx.beginPath();
        ctx.moveTo(xCoords.frontToeStart, dimensionLineY);
        ctx.lineTo(xCoords.backHeelEnd, dimensionLineY);
        ctx.stroke();

        segments.forEach(seg => {
            // Draw extension lines from abutment to dimension line
            ctx.strokeStyle = '#888';
            ctx.beginPath();
            ctx.moveTo(seg.from.x, seg.from.y);
            ctx.lineTo(seg.from.x, dimensionLineY - tickSize);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(seg.to.x, seg.to.y);
            ctx.lineTo(seg.to.x, dimensionLineY - tickSize);
            ctx.stroke();

            // Draw ticks on the dimension line
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(seg.start, dimensionLineY - tickSize);
            ctx.lineTo(seg.start, dimensionLineY + tickSize);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(seg.end, dimensionLineY - tickSize);
            ctx.lineTo(seg.end, dimensionLineY + tickSize);
            ctx.stroke();

            // Draw label
            if (seg.label > 0) {
                const centerX = (seg.start + seg.end) / 2;
                ctx.fillText(seg.label.toString(), centerX, textY);
            }
        });
    }

    drawButton.addEventListener('click', drawAbutment);

    // Initial draw on page load
    drawAbutment();
});