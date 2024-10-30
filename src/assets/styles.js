import { StyleSheet } from "react-native"
import { Dimensions } from 'react-native';
import { RFValue } from "react-native-responsive-fontsize";

const { width, height } = Dimensions.get('window');

const constStyles = StyleSheet.create({
    loginMainTitle: {
        fontSize: RFValue(22),
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10
    },

    loginMainTitle1: {
        fontSize: RFValue(20),
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },

    loginSubTitle: {
        fontSize: RFValue(17),
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'left',
        paddingTop: 10,
        paddingBottom: 10,
    },

    loginMiddleText: {
        fontSize: RFValue(15),
        margin: 0,
        lineHeight: RFValue(15),
        color: 'black'
    },

    loginSmallText: {
        fontSize: RFValue(12),
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'left',
        marginTop: RFValue(10),
        paddingHorizontal: 15
    },

    loginTextInput : {
        backgroundColor: 'white', 
        height: RFValue(40), 
        marginBottom: RFValue(10), 
        borderWidth: RFValue(1), 
        fontSize: RFValue(14),
        borderColor: 'hsl(0, 0%, 86%)'
    },

    loginCheckBox:{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: RFValue(10),
        marginTop: RFValue(10)
    },

    logincheckmark: {
        fontSize: 12,
        color: '#000',
    },

    loginSubBtn: {
        padding: RFValue(10),
        backgroundColor: '#DF1828FF',
        color: 'white',
        fontSize: RFValue(15),
    },

    loginMainButton: {
        fontSize: RFValue(12),
        padding: RFValue(10),
        borderWidth: RFValue(3),
        borderColor: 'white',
        borderRadius: RFValue(10)
    },

    forgotInputText: {
        backgroundColor: 'white', 
        height: RFValue(40), 
        marginBottom: RFValue(10), 
        borderWidth: RFValue(1), 
        borderColor: 'hsl(0, 0%, 86%)',
        paddingVertical: RFValue(5)
    },

    signUpText: {
        fontSize: RFValue(13),
        color: 'hsl(0, 0%, 29%)',
        fontWeight: 'bold',
        textAlign: 'left',
        marginTop: RFValue(10),
        lineHeight: RFValue(20)
    },

    signUpSubtitle: {
        fontSize: RFValue(15),
        color: 'black',
        textAlign: 'left',
        paddingTop: RFValue(10),
        paddingBottom: RFValue(10),
        fontWeight: 'bold'
    },

    signUpinput: {
        backgroundColor: 'white', 
        fontSize: RFValue(14),
        height: RFValue(30), 
        marginBottom: RFValue(10), 
        borderWidth: 1, 
        borderColor: 'hsl(0, 0%, 86%)',
    },

    signUpsmalltitle:{
        color: 'black', 
        paddingLeft: 5, 
        fontSize: RFValue(13),
        marginTop: RFValue(2)
    },

    signUpbtnSheet: {
		height: RFValue(100),
		width:RFValue(100),
		justifyContent: "center",
		alignItems: "center",
		borderRadius: RFValue(10),
		shadowOpacity: RFValue(0.5),
		shadowRadius: RFValue(10),
		margin: RFValue(5),
		shadowColor: '#000',
		shadowOffset: { width: 3, height: 3 },
		marginVertical: RFValue(12), 
        padding: RFValue(5),
	},

    signUpheaderText: {
        fontSize: RFValue(18),
        fontWeight: 'bold',
        color: 'black'
    },

    profileChooseButton : {
        fontWeight: '400', 
        padding: 0, 
        fontSize: RFValue(12), 
        color: 'black',
    },

    profileChoosenText : {
        color: '#0000ff', 
        textDecorationLine: 'underline', 
        fontSize: RFValue(12)
    }
})

export default constStyles;