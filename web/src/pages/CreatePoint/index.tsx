import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';
import './styles.css';
import ImageDrop from '../../components/imageDrop'; 

import api from '../../services/api';

import logo from '../../assets/logo.svg';

interface item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUfs {
    sigla: string
}

interface IBGECities {
    nome: string
}

const CreatePoint = () => {
    const [items, setItems] = useState<item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [initPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [positionMap, setPositionMap] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const history = useHistory();

    const [dataForm, setDataForm] = useState({
        name: '',
        email: '',
        whatsapp: '', 
    });

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        })
    }, [])
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, [])

    useEffect(() => {
        axios.get<IBGEUfs[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const initials = response.data.map(uf => uf.sigla);
            setUfs(initials);
        });
    }, [])

    useEffect(() => {
        if(selectedUF === '0') {
            return;
        }
        axios.get<IBGECities[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
            const citiesName = response.data.map(city => city.nome);
            setCities(citiesName);
        });
    }, [selectedUF])

    function handleChangedSelect(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUF(event.target.value);
    }

    function handleChangeSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setPositionMap([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setDataForm({ ...dataForm, [name]: value });
    }

    function handleSelectItems(id: number) {
        const alreadySelected =  selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0) {
            const filterSelectedItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filterSelectedItems);
        } else {
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = dataForm;
        const uf = selectedUF;
        const city = selectedCity;
        const [ latitude, longitude ] = positionMap;
        const items = selectedItems;

        const data = new FormData()

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));

        if(selectedFile) {
            data.append('image', selectedFile);
        }

        await api.post('points', data);

        alert('ponto de coleta criado com sucesso');

        history.push('/');
       
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta logo"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <ImageDrop onFileUploaded={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da emtidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa.</span>
                    </legend>

                    <Map center={initPosition} zoom={15} onClick={handleMapClick}> 
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributers'
                            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        />

                        <Marker position={positionMap}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUF} onChange={handleChangedSelect}>
                                <option value="0">Selecione uma uf</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleChangeSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ìtems de coleta</h2>
                        <span>Selecione um ou mais items abaixo.</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => handleSelectItems(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>   
    );
}

export default CreatePoint;