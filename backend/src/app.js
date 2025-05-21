const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // O el puerto donde corre tu frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());
app.use(cookieParser()); 