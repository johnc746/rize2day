import React, { useState, useEffect } from "react";
import cn from "classnames";
import Icon from "../../components/Icon";
import styles from "./Profile.module.sass";
import styles1 from "./ProfileEdit.module.sass";
import styles2 from "./UploadDetails.module.sass";
import { toast } from 'react-toastify';
import axios from "axios";
import { config, CATEGORIES } from "app/config.js";
import Modal from "components/Modal";
import TextInput from "../../components/TextInput";
import Dropdown from "../../components/Dropdown";
import MultipleInput from "../../components/MultipleInput";
import Alert from "../../components/Alert";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from "app/hooks";
// import { getValidWallet } from "../../InteractWithSmartContract/interact";

import ButtonPrimary from "shared/Button/ButtonPrimary";
import { selectCurrentChainId, selectCurrentUser } from "app/reducers/auth.reducers";
import { changeConsideringCollectionId } from "app/reducers/collection.reducers";
import FormItem from "components/FormItem";
import Input from "shared/Input/Input";
import { useNavigate } from "react-router-dom";
import { Backdrop, CircularProgress } from "@mui/material";
import { Helmet } from "react-helmet";
import { useSigningClient } from "app/cosmwasm";


const ColorModeContext = React.createContext({ CollectionSelect: () => { } });

const CreateCollection = () => {
  const categoriesOptions = CATEGORIES;

  // const [visible, setVisible] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const [logoImg, setLogoImg] = useState("");
  const [bannerImg, setBannerImg] = useState("");
  const [textName, setTextName] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [categories, setCategories] = useState(categoriesOptions[0]);
  const [floorPrice, setFloorPrice] = useState(0);
  const [metaFieldInput, setMetaFieldInput] = useState("");
  const [metaFields, setMetaFields] = useState([]);
  const [metaFieldDatas, setMetaFieldDatas] = useState([]);
  const [metaArry, setMetaArray] = useState([]);
  const [removeField, setRemoveField] = useState(false);
  const [consideringField, setConsideringField] = useState("");
  const [consideringFieldIndex, setConsideringFieldIndex] = useState(0);
  const [alertParam, setAlertParam] = useState({});
  const [working, setWorking] = useState(false);
  const { addCollection, getConfig, collection, getOwnedCollections } = useSigningClient();

  const [mode, setMode] = React.useState('light');
  const colorMode = React.useContext(ColorModeContext);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const currentUsr = useAppSelector(selectCurrentUser);
  const currentChainId = useAppSelector(selectCurrentChainId);

  useEffect(() => {
    let thmode = localStorage.getItem("darkMode");
    if (thmode?.toString() === "true") setMode('dark');
    else setMode('light');
  }, [])

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        components: {
          MuiStack: {
            styleOverrides: {
              root: {
                width: '100% !important',
                border: '2px solid #353945',
                borderRadius: '12px'
              }
            }
          }
        }
      }),
    [mode],
  );

  const changeBanner = (event) => {
    var file = event.target.files[0];
    if (file == null) return;
    console.log(file);
    setSelectedBannerFile(file);
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setBannerImg(reader.result);
    };
    reader.onerror = function (error) {
    }
  }

  const changeAvatar = (event) => {
    var file = event.target.files[0];
    if (file == null) return;
    console.log(file);
    setSelectedAvatarFile(file);
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setLogoImg(reader.result);
    };
    reader.onerror = function (error) {
    }
    document.getElementById("preSelectSentence").style.display = "none";
  }

  const saveCollection = async (params) => {

    setWorking(true);
    let newCollectionId = 0;
    axios({
      method: "post",
      url: `${config.API_URL}api/collection/`,
      data: params
    })
      .then(async function (response) {
        newCollectionId = response.data.data._id;
        let isCreatingNewItem = localStorage.getItem("isNewItemCreating");
        if (isCreatingNewItem) localStorage.setItem("newCollectionId", newCollectionId);
        setWorking(false);
        dispatch(changeConsideringCollectionId(newCollectionId));
        console.log("newColllectionId ===> ", newCollectionId);
        try {
          const cratedTx = await addCollection(
            currentUsr.address,
            10000,
            textName,
            "Rize2DayNFT",
            config.CW721_CODE_ID,
            100000,
            [
              {
                "address": currentUsr.address,
                "rate": 50000
              },
              {
                "address": "devcore18a97jc79x8mt5hxzchf6h039gn7vk43dwrjnt6",
                "rate": 10000
              }
            ],
            newCollectionId
          );
          console.log("cratedTx:", cratedTx)
          if (cratedTx != -1) {
            //read created collection info here
            let newCollections = await getOwnedCollections(currentUsr.address);
            console.log(">>>> newCollectionInfo >>>", newCollections)
            if (newCollections?.list.length > 0) {
              let newCollectionInfo = newCollections.list[newCollections.list.length - 1];
              console.log("newCollectionInfo ===> ", newCollectionInfo);
              axios({
                method: "put",
                url: `${config.API_URL}api/collection/${newCollectionId}`,
                data: {
                  collectionNumber: newCollectionInfo.id,
                  address: newCollectionInfo.collection_address,
                  cw721address: newCollectionInfo.cw721_address
                }
              })
                .then((response) => {
                  console.log("updating collection : ", response);
                  if (response.data.code == 0) {
                    toast.success(<div>You 've created a new collection.</div>);
                    navigate("/collectionList");
                  }
                })
                .catch(error => { })
            }
          } else {
            toast.error("Transaction failed!");
          }
        } catch (error) {
          console.log("error >>>>>>", error);
          toast.error(error.message);
          //delete collection data using newCollectionId and ownner
          axios({
            method: "post",
            url: `${config.API_URL}api/collections/removeOne`,
            data: {
              _id: newCollectionId,
              owner: currentUsr.address || ""
            }
          }).then(data => { }).catch(errror => { });
        }
      })
      .catch(function (error) {
        console.log("creating collection error : ", error);
        toast.error("Uploading failed");
        setWorking(false);
      });
  }

  const createCollection = async () => {

    if (currentUsr === null || currentUsr === undefined) {
      toast.warn("Please sign in and try again.");
      return;
    }
    if (selectedAvatarFile === null || selectedBannerFile === null) {
      toast.warn("You have to select banner and avatar.");
      return;
    }
    if (textName === "") {
      toast.warn("Collection name can not be empty.");
      return;
    }
    setWorking(true);
    var formData = new FormData();
    formData.append("itemFile", selectedAvatarFile);
    formData.append("authorId", "hch");

    const params = {};
    await axios({
      method: "post",
      url: `${config.API_URL}api/utils/upload_file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        params.collectionLogoURL = response.data.path;
      })
      .catch(function (error) {
        console.log(error);
        toast.error("Uploading failed.");
        setWorking(false);
        return;
      });

    formData = new FormData();
    formData.append("itemFile", selectedBannerFile);
    formData.append("authorId", "hch");
    await axios({
      method: "post",
      url: `${config.API_URL}api/utils/upload_file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        params.collectionBannerURL = response.data.path;
        params.collectionName = textName;
        params.collectionDescription = textDescription;
        params.collectionCategory = categories.value;
        params.price = floorPrice;
        params.owner = currentUsr._id;
        params.metaData = metaArry;
        saveCollection(params);
      })
      .catch(function (error) {
        console.log(error);
        toast.error("Uploading failed.");
        setWorking(false);
      });
  }

  const setAddMetaField = () => {
    if (metaFieldInput !== "") {
      let mfs = metaFields;
      mfs.push(metaFieldInput);
      setMetaFields(mfs);
      setMetaFieldInput("");
    }
  }

  const onRemoveMetaFieldInput = (index) => {
    let socs1 = [];
    socs1 = metaFields;
    socs1.splice(index, 1);
    setMetaFields(socs1);

    let socs2 = [];
    socs2 = metaFieldDatas;
    socs2.splice(index, 1);
    setMetaFieldDatas(socs2);

    let i;
    let metaFdArry = [];
    for (i = 0; i < socs1.length; i++) {
      if (socs2[i] && socs2[i].length > 0) {
        metaFdArry.push({ key: socs1[i], value: socs2[i] });
      }
    }
    setMetaArray(metaFdArry);

  }

  const onChangeMetaFieldValue = (data, metaIndex) => {
    if (data !== "" && data !== undefined) {
      let mfds = metaFieldDatas;
      mfds[metaIndex] = data;
      setMetaFieldDatas(mfds);

      let socs1 = [];
      socs1 = metaFields;
      let socs2 = [];
      socs2 = metaFieldDatas;

      let i;
      let metaFdArry = [];
      for (i = 0; i < socs1.length; i++) {
        if (socs2[i] && socs2[i].length > 0) {
          metaFdArry.push({ key: socs1[i], value: socs2[i] });
        }
      }
      setMetaArray(metaFdArry);

    }
  }

  const onClickRemoveField = (index) => {
    setRemoveField(false);
    onRemoveMetaFieldInput(index);
  }

  const doRemovingModal = (index, field) => {
    setConsideringFieldIndex(index);
    setConsideringField(field);
    setRemoveField(true);
  }

  return (
    <>

      <Helmet>
        <title>Create a collection || Rize2Day </title>
      </Helmet>
      <div className="container">
        <div style={{ paddingTop: "3rem", paddingRight: "3rem" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>Create a collection</h1>
        </div>
        <div className={styles1.user} style={{
          marginTop: "1rem"
        }}>
          <div className={styles1.details}>
            <div className={styles1.stage}>Logo image</div>
            <div className={styles1.text}>
              This image will also be used for navigation. 350x350 recommend
            </div>
            <div className={styles2.file} style={{ border: "3px dashed rgb(204, 204, 204)", borderRadius: "50%", width: "160px", height: "160px" }}>
              <div id="preSelectSentence" style={{ position: "absolute" }}>
                <div className={styles2.icon}>
                  <Icon name="upload-file" size="24px" />
                </div>
              </div>
              <input className={styles1.load} type="file" onChange={changeAvatar} />
              <div className={styles1.avatar} >
                {logoImg !== "" && <img id="avatarImg" src={logoImg} alt="Avatar" />}
              </div>
            </div>
          </div>
        </div>
        <div className={styles1.user} style={{
          marginTop: "1rem"
        }}>
          <div className={styles1.details}>
            <div className={styles1.stage}>Banner image</div>
            <div className={styles1.text}>
              This image will be appear at the top of your collection page. Avoid including too much text
              in this banner image, as the dimensions change on different devices. 1400x400 recommend.
            </div>
          </div>
        </div>
        <div className={styles2.item} style={{ border: "3px dashed rgb(204, 204, 204)", height: "200px" }}>
          <div className={styles2.file}>
            <div className={styles2.icon}>
              <Icon name="upload-file" size="48px" />
            </div>
            <input className={styles2.load} type="file" onChange={changeBanner} />
            <div >
              {bannerImg !== "" && <img id="BannerImg" src={bannerImg} alt="Banner" />}
            </div>
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles1.stage}>Collection Details</div>
          <div className="flex flex-col gap-5 mt-5">
            <FormItem label="Name *">
              <Input defaultValue="name"
                value={textName}
                onChange={(event) => {
                  setTextName(event.target.value);
                }}
              />
            </FormItem>
            <FormItem label="Description">
              <Input defaultValue="description"
                value={textDescription}
                onChange={(event) => {
                  setTextDescription(event.target.value);
                }}
              />
            </FormItem>
            <FormItem
              label={`FLOOR PRICE 
            
            `}
            >
              <Input defaultValue="0.0001 "
                value={floorPrice}
                type="number"
                min="0"
                step="0.001"
                onChange={(event) => {
                  setFloorPrice(event.target.value);
                }}
              />
            </FormItem>
            <FormItem label="CATEGORY" >
              <Dropdown
                className={styles.dropdown}
                value={categories}
                setValue={setCategories}
                options={categoriesOptions}
              />
            </FormItem>
            {/* <div className="row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: '14px'
            }}
          >
            <div style={{
              width: "95%"
            }}>
              <TextInput
                className={styles.field}
                label="Metadata"
                // key={index}
                name={metaFieldInput}
                type="text"
                value={metaFieldInput}
                onChange={(e) => setMetaFieldInput(e.target.value)}
              />
            </div>
            <div
              style={{
                width: "20%",
                paddingLeft: "5px",
                paddingTop: '30px'
              }}
            >
              <button
                className={cn("button-stroke button-small", styles.button)}
                onClick={() => setAddMetaField()}
                style={{ width: "100%" }}
              >
                <Icon name="plus-circle" size="16" />
                <span>Add field</span>
              </button>
            </div>
          </div> */}
            {
              metaFields && metaFields.length > 0 &&
              metaFields.map((field, index) => (
                <div className="row" key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: '14px'
                  }}
                >
                  <div style={{
                    width: "95%",
                  }}>
                    <ColorModeContext.Provider value={colorMode}>
                      <ThemeProvider theme={theme}>
                        <MultipleInput className={styles.multipleInput} label={field} metaIndex={index} onChange={onChangeMetaFieldValue} />
                      </ThemeProvider>
                    </ColorModeContext.Provider>
                  </div>
                  <div
                    style={{
                      width: "20%",
                      paddingLeft: "10px"
                    }}
                  >
                    <button
                      className={cn("button-stroke button-small", styles.button)}
                      onClick={() => doRemovingModal(index, field)}
                      style={{ width: "100%" }}
                    >
                      <Icon name="close-circle" size="16" />
                      <span>Remove field</span>
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
          <div className={styles2.foot} style={{
            marginTop: "1rem",
            marginBottom: "5rem"
          }}>
            <ButtonPrimary
              className={cn("button", styles2.button)}
              onClick={() => createCollection()}
              // type="button" hide after form customization
              type="button"
            >
              <span>Create Collection</span>
            </ButtonPrimary>
          </div>
        </div>
        <Modal visible={removeField} onClose={() => setRemoveField(false)} >
          <div className={styles.field}>
            Are you going to delete {consideringField} field?
          </div>
          <button className={cn("button", styles.button)}
            style={{
              width: "-webkit-fill-available",
              marginTop: "1rem"
            }}
            onClick={() => onClickRemoveField(consideringFieldIndex)}>
            Yes
          </button>
        </Modal>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={working}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    </>
  );
};

export default CreateCollection;
