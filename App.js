/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, Text, View, Button, PermissionsAndroid, Alert } from "react-native";

var Mailer = require( 'NativeModules' ).RNMail;
import PDFLib, { PDFDocument, PDFPage } from 'react-native-pdf-lib';
var RNFS = require( 'react-native-fs' );
import RNFetchBlob from 'react-native-fetch-blob';
import Permissions from 'react-native-permissions'

export default class App extends Component
{

  constructor ( props )
  {
    super( props )
    this.state = ( {
      pdfFilePath: ""
    } )
  }


  async componentDidMount ()
  {
    if ( Platform.OS == "android" )
    {
      try
      {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message:
              'Write storage permission need.',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
      } catch ( err )
      {
        console.warn( err );
      }
    }
  }

  //TODO: Downlod pdf

  click_downPdf = async () =>
  {
    let keys = "uskillshare";
    var docsDir;
    if ( Platform.OS == "android" )
    {
      docsDir = await RNFS.ExternalStorageDirectoryPath //RNFS.DocumentDirectoryPath;
    } else
    {
      docsDir = await PDFLib.getDocumentsDirectory();
    }
    docsDir = Platform.OS === 'android' ? `file://${ docsDir }` : docsDir;
    console.log( { docsDir } );
    var path = `${ docsDir }/USkillShare.png`;
    await RNFetchBlob.fetch( 'GET', "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + keys, {
    } )
      .then( ( res: any ) =>
      {
        let base64Str = res.base64()
        RNFS.writeFile( path, base64Str, "base64" )
          .then( ( success: any ) =>
          {
            console.log( 'image stored.' );
            this.creatpdffile();
          } )
          .catch( ( err: any ) =>
          {
            console.log( { err } );

          } )
      } )
      .catch( ( errorMessage: string ) =>
      {
        Alert.alert( errorMessage )

      } )
  }

  creatpdffile = async () =>
  {
    var docsDir;
    if ( Platform.OS == "android" )
    {
      docsDir = await RNFS.ExternalStorageDirectoryPath;
    } else
    {
      docsDir = await PDFLib.getDocumentsDirectory();
    }
    const pdfPath = `${ docsDir }/USkillShare.pdf`;
    docsDir = Platform.OS === 'android' ? `/${ docsDir }` : docsDir;
    const qrcodeimg = `${ docsDir }/USkillShare.png`;
    const page1 = PDFPage
      .create()
      .drawText( 'He here qrcode appasaheb.', {
        x: 5,
        y: 480,
        fontSize: 18
      } )
      .drawImage(
        qrcodeimg,
        'png',
        {
          x: 25,
          y: 270,
          width: 200,
          height: 200,
          //source: 'assets'
        }
      )

    const page2 = PDFPage
      .create()
      .drawText( 'New page here page2', {
        x: 5,
        y: 480,
        fontSize: 10
      } )

    PDFDocument
      .create( pdfPath )
      .addPages( page1, page2 )
      .write() // Returns a promise that resolves with the PDF's path
      .then( path =>
      {
        console.log( 'PDF created at: ' + path );
        this.setState( {
          pdfFilePath: path
        } )
      } );



  }

  click_sharePdf ()
  {

    let pdfFilePath = this.state.pdfFilePath;
    Mailer.mail( {
      subject: 'Store secure account pdf.',
      recipients: [ 'onlyappasaheb4@gmail.com' ],
      body: 'USkill Share qrcode file.',
      isHTML: true,
      attachment: {
        path: pdfFilePath,  // The absolute path of the file from which to read data.
        type: 'pdf',      // Mime Type: jpg, png, doc, ppt, html, pdf, csv
        name: 'USkillShare',   // Optional: Custom filename for attachment
      }
    }, ( error, event ) =>
      {
        if ( event == "sent" )
        {

          Alert.alert(
            "Success",
            "Email sent success.",
            [
              { text: 'Ok', onPress: () => console.log( 'OK' ) },
            ],
            { cancelable: true }
          )
        } else
        {
          Alert.alert(
            error,
            event,
            [
              { text: 'Ok', onPress: () => console.log( 'OK: Email Error Response' ) },
            ],
            { cancelable: true }
          )
        }
      } );
  }
  render ()
  {
    return (
      <View style={ styles.container }>
        <Text style={ styles.welcome }>Welcome to React Native!</Text>
        <Text style={ styles.instructions }>Deploy app</Text>

        <Button title="Download PDF" onPress={ () => this.click_downPdf() }>
        </Button>

        <Button title="Share PDF" onPress={ () => this.click_sharePdf() }>
        </Button>

      </View>
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
} );
