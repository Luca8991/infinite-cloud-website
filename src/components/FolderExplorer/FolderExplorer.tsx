import { useCallback, useEffect, useState } from "react";
import FileBrowser, { FileBrowserFile } from 'react-keyed-file-browser';
import { IonButton, IonIcon, IonItem, IonLabel, IonSpinner, useIonToast } from "@ionic/react";
import { archive, calculator, closeCircleOutline, cloudDownload, document, documentOutline, documentText, easel, film, folder, folderOpen, image, musicalNotes, pencil, trash } from "ionicons/icons";

import constants from "../../constants/constants";
import { UserModel } from "../../models/auth.model";

import './FolderExplorer.css';
import { FileModel } from "../../models/filesystem.model";

type Props = {
    user: UserModel,
}

const FolderExplorer = ({ user }: Props) => {
    const [filesystem, setFilesystem] = useState<FileModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [present, dismiss] = useIonToast();

    const downloadFileHandler = async (messageId: number | undefined) => {
        if (messageId) {
            const res = await fetch(`${constants.functionsUrl}/downloadFile`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({
                    userId: user.id,
                    messageId,
                }),
            });
            if (res.status === 200) {
                present({
                    header: 'Ready to download',
                    position: 'top',
                    message: 'File reference has been sent to your chat',
                    duration: 3000,
                });
            } else {
                present('There was an error', 3000);
            }
        }
    };

    const getFilesystem = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${constants.functionsUrl}/getFilesystem?userId=` + user.id);
            console.log(res);
            if (res.status === 200) {
                setFilesystem((await res.json()).data);
            } else {
                throw new Error(res.statusText);
            }
        } catch (err) {
            setError(err.message);
        }
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        getFilesystem();
    }, [getFilesystem]);

    if (isLoading) {
        return (
            <div className="status-message">
                <h2>Fetching your filesystem</h2>
                <IonSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="status-message">
                <h2>There was an error</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="explorer-container">
            <FileBrowser
                files={filesystem as FileBrowserFile[]}
                icons={{
                    Image: <IonIcon className="explorer-icon" icon={image} />,
                    PDF: <IonIcon className="explorer-icon" icon={document} />,
                    Folder: <IonIcon className="explorer-icon" icon={folder} />,
                    FolderOpen: <IonIcon className="explorer-icon" icon={folderOpen} />,
                    Word: <IonIcon className="explorer-icon" icon={documentText} />,
                    Delete: <IonIcon className="explorer-icon" icon={trash} />,
                    Download: <IonIcon className="explorer-icon" icon={cloudDownload} />,
                    Audio: <IonIcon className="explorer-icon" icon={musicalNotes} />,
                    Archive: <IonIcon className="explorer-icon" icon={archive} />,
                    Text: <IonIcon className="explorer-icon" icon={documentText} />,
                    File: <IonIcon className="explorer-icon" icon={documentOutline} />,
                    Video: <IonIcon className="explorer-icon" icon={film} />,
                    Excel: <IonIcon className="explorer-icon" icon={calculator} />,
                    PowerPoint: <IonIcon className="explorer-icon" icon={easel} />,
                    Rename: <IonIcon className="explorer-icon" icon={pencil} />,
                    Loading: <IonSpinner />,
                }}
                renderStyle='table'
                noFilesMessage='This folder is empty'
                detailRenderer={(props) => {
                    console.log(props);
                    const fileKey = props.file.key;
                    const fileName = props.file.name;
                    const fileData = filesystem.find(el => el.key === fileKey);
                    return (
                        <IonItem>
                            <IonButton fill="clear" slot="start" onClick={() => downloadFileHandler(fileData?.messageId)}>
                                <IonIcon slot="icon-only" icon={cloudDownload} />
                            </IonButton>
                            <IonLabel>
                                <h2>{fileName}</h2>
                            </IonLabel>
                            <IonButton fill="clear" slot="end" onClick={() => props.close()}>
                                <IonIcon slot="icon-only" icon={closeCircleOutline} />
                            </IonButton>
                        </IonItem>
                    );
                }}

            />
        </div>
    );
};

export default FolderExplorer;