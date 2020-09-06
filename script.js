let socket = new WebSocket("ws://192.168.1.61:5000");

class Scene {
  constructor(api) {
    this.coords = {x: 0, y: 0};
    this.shape = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
      draggable: true
    });
    this.layer = new Konva.Layer();
    this.stage = new Konva.Stage({
      container: 'app',
      width: window.innerWidth,
      height: window.innerHeight
    });
    this.api = api;
    this.mouse = null;
  }

  initiate() {
    this.shape.on('dragmove', (e) => {
      const circle = e.target;
      const mouse = this.stage.getPointerPosition();
      const coords = {x: circle.x(), y: circle.y(), mouseX: mouse.x, mouseY: mouse.y};
      const message = { type: 'shape', coords };
      this.api.send(JSON.stringify(message));
    })

    this.stage.on('mousemove', (e) => {
      const mouse = e.evt;
      const coords = {mouseX: mouse.x, mouseY: mouse.y};
      const message = { type: 'mouse', coords };
      this.api.send(JSON.stringify(message));
    })
    
    this.layer.add(this.shape);
    
    this.stage.add(this.layer);
  }

  initiateMouse() {
    this.mouse = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 10,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 1
    });
    this.layer.add(this.mouse);
  }

  setMouse({mouseX, mouseY}) {
    this.mouse.x(mouseX);
    this.mouse.y(mouseY);
  }

  setCoords({x, y}) {
    this.shape.x(x);
    this.shape.y(y);
  }

  redraw() {
    this.layer.draw();
  }
}

const scene = new Scene(socket);
scene.initiate();

socket.onopen = (e) => {
  console.log('Socket opened')
};

socket.onmessage = (event) => {
  const object = JSON.parse(event.data);
  if (object.type === 'mouse') {
    if (!scene.mouse) scene.initiateMouse();
    scene.setMouse(object.coords);
    scene.redraw();
  }
  if (object.type === 'shape') {
    if (!scene.mouse) scene.initiateMouse();
    const {x, y, mouseX, mouseY} = object.coords;
    scene.setCoords({ x, y });
    scene.setMouse({ mouseX, mouseY });
    scene.redraw();
  }
  if (object.type === 'initiate') {
    scene.setCoords(object.coords);
    scene.redraw();
  }
};

socket.onclose = (event) => {
  if (event.wasClean) {
    console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
  } else {
    console.log('[close] Соединение прервано');
  }
};

socket.onerror = (error) => {
  console.log(`[error] ${error.message}`);
};
