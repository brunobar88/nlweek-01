import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

import './styles.css';

interface Props {
    onFileUploaded: (file: File) => void
}

const ImageDrop: React.FC<Props> = ({ onFileUploaded }) => {
    const [selectedFileUrl, setSelectedFileUrl] = useState('');

    const onDrop = useCallback(aceptedFiles => {
        const file = aceptedFiles[0];

        const fileUrl = URL.createObjectURL(file);
        
        setSelectedFileUrl(fileUrl);
        onFileUploaded(file);
    }, [onFileUploaded]);

    const {getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*',
    })

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept="image/*"/>

            {
                selectedFileUrl ?
                <img src={selectedFileUrl} alt="point thumbnail"/> :
                (
                    <p>
                        <FiUpload />    
                        imagem do estabelecimento.
                    </p>
                )
            }
          
        </div>
    );
};

export default ImageDrop;