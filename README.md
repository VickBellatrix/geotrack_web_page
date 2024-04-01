# geotrack_web_page
**Project Description: Real-Time Geotracking System**

This project is a real-time geotracking system built using Node.js, Express.js, and MySQL, designed to track and store geographical coordinates with timestamps from a sniffer device. Leveraging TCP/IP communication, the system establishes a server that listens to incoming data from the sniffer and processes it, extracting latitude, longitude, date, and time information. 

Upon receiving data, the system stores it in a MySQL database for further analysis and retrieval. It utilizes an error handling mechanism for ensuring reliable data ingestion. The backend is complemented with frontend interfaces, allowing users to visualize real-time data on a map, query historical data, and filter data by date and time ranges.

Key Components:
- **Node.js Backend**: Utilizes Express.js framework for handling HTTP requests, along with the native 'net' module for TCP server implementation.
- **MySQL Database**: Stores geolocation data including latitude, longitude, date, and time for retrieval and analysis.
- **Real-Time Data Visualization**: Integrates with Leaflet.js library for rendering interactive maps and displays live tracking information.
- **Historical Data Analysis**: Implements endpoints for querying historical data and filtering by date and time ranges.
- **Error Handling**: Implements error handling mechanisms to ensure system stability and data integrity.

This project showcases practices in DevOps methodologies, including continuous integration and deployment (CI/CD) and version control. It fosters collaboration among development, operations, and QA teams, ensuring seamless deployment and maintenance of the geotracking system.

**Cosas por arreglar**

De la página 
- Despliegue en cada una de las instancias
- Url sin el puerto
- Las url de direccionamiento de cada pagina segun la ip de cada instancia (dice localhost)

Del github
- Que no se pueda subir al main sin la aprobación de todos
- Que el main tenga todas las prevenciones para evitar conflictos o perdidas de líneas accidentales
- ~~Variables de entorno~~

En la visualización en tiempo real
- ~~Que el zoom del mapa no sea impuesto~~
- ~~Hacer que el popup de información de ubicación y timestamp solo salga cuando se hace click en el marcador de ubicación~~

En la visualización de historicos
- ~~Añadir polilinea de los recorridos históricos~~
- Enviar mensaje de advertencia cuando no hay datos en las fechas seleccionadas
- ~~Que filtre por horas~~
- ~~Que el formato de horas no dependa del sistema operativo~~

En la base de datos
- Nutrir la base de datos con información acerca de las últimas 2 semanas

**Hacer pruebas para ambas páginas de tiempo real e históricos**
