const ServiceCarbono = require('../service/carbonoService');
const serviceCarbono = new ServiceCarbono();

const axios = require("axios");

const getCoordinatesFromPostalCode = async (req, res, next) => {
    try {
        const tokenCheck = await axios.post('http://localhost:5003/api/v2/usuarios/checkToken', {}, {
            headers: {
                "Authorization": req.headers.authorization
            }
        }).then((result) => {
            return result;
        });

        if (tokenCheck.status < 200 && tokenCheck.status > 299) {
            res.status(tokenCheck.status).send(tokenCheck.message)
        } else {
            const coordenadas = await serviceCarbono.getCoordenadasByCodPostal(req.query.codPostal)
            res.status(200).json(coordenadas)
        }
    } catch (error) {
        res.status(401).send({success: false, message: 'No se ha podido obtener las coordenadas para el código postal ' + req.query.codPostal});
    }
}

const getHuellaCarbono = async (req, res) => {
    try {
        const tokenCheck = await axios.post('http://localhost:5003/api/v2/usuarios/checkToken', {}, {
            headers: {
                "Authorization": req.headers.authorization
            }
        }).then((result) => {
            return result;
        });

        if (tokenCheck.status < 200 && tokenCheck.status > 299) {
            res.status(tokenCheck.status).send(tokenCheck.message)
        } else {
            const huella = await serviceCarbono.getHuellaCarbono(req.query.userLat, req.query.userLong, req.query.codPostalProducto);
            res.status(200).send(huella);
        }
    } catch (error) {
        res.status(500).send({success: false, message: error.message});
    }
}

module.exports = {getCoordinatesFromPostalCode, getHuellaCarbono}